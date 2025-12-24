import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, title } = await req.json();
    
    console.log("Analyzing syllabus:", title);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Call Lovable AI to analyze syllabus and extract important topics
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an educational AI assistant that analyzes syllabus content and extracts important topics. 
            Analyze the syllabus and identify 5-8 most important topics that students should focus on.
            For each topic, determine its importance level (high, medium, or low) and provide a brief description.
            Format your response as a JSON array of objects with fields: title, importance, description.
            Example: [{"title": "Algebra Basics", "importance": "high", "description": "Foundation of mathematical operations"}]`,
          },
          {
            role: "user",
            content: `Analyze this syllabus and extract important topics:\n\n${content}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;
    
    console.log("AI response received:", aiResponse);

    // Parse the JSON response from AI
    let topics;
    try {
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        topics = JSON.parse(jsonMatch[0]);
      } else {
        topics = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("AI response was:", aiResponse);
      
      // Return a helpful error to the user
      return new Response(
        JSON.stringify({ 
          error: "The AI couldn't analyze the syllabus properly. Please ensure the content is clear and contains educational information." 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Get the authorization header from the request
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create Supabase client with user's JWT
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user from JWT
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Authentication failed");
    }

    // Save syllabus to database
    const { data: syllabusData, error: syllabusError } = await supabase
      .from("syllabi")
      .insert({
        user_id: user.id,
        title,
        content,
      })
      .select()
      .single();

    if (syllabusError) {
      console.error("Failed to save syllabus:", syllabusError);
      throw syllabusError;
    }

    console.log("Syllabus saved:", syllabusData.id);

    // Save topics to database
    const topicsToInsert = topics.map((topic: any) => ({
      syllabus_id: syllabusData.id,
      title: topic.title,
      importance: topic.importance,
      description: topic.description,
    }));

    const { data: topicsData, error: topicsError } = await supabase
      .from("topics")
      .insert(topicsToInsert)
      .select();

    if (topicsError) {
      console.error("Failed to save topics:", topicsError);
      throw topicsError;
    }

    console.log("Topics saved:", topicsData.length);

    return new Response(
      JSON.stringify({
        syllabusId: syllabusData.id,
        topics: topicsData,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in analyze-syllabus:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});