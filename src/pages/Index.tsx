import { useState, useEffect } from "react";
import { BookOpen, Upload, MessageSquare, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TopicsList from "@/components/TopicsList";
import ChatInterface from "@/components/ChatInterface";
import FileUpload from "@/components/FileUpload";
import Auth from "@/components/Auth";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [step, setStep] = useState<"input" | "topics" | "chat">("input");
  const [inputMethod, setInputMethod] = useState<"upload" | "describe" | null>(null);
  const [syllabusText, setSyllabusText] = useState("");
  const [syllabusTitle, setSyllabusTitle] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [topics, setTopics] = useState([]);
  const [syllabusId, setSyllabusId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    setIsCheckingAuth(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setStep("input");
    setInputMethod(null);
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  const handleAnalyze = async () => {
    if (!syllabusText.trim() || !syllabusTitle.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and content for your syllabus.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to analyze your syllabus.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke("analyze-syllabus", {
        body: {
          content: syllabusText,
          title: syllabusTitle,
        },
      });

      if (error) {
        console.error("Analysis error:", error);
        throw error;
      }

      setTopics(data.topics);
      setSyllabusId(data.syllabusId);
      setStep("topics");

      toast({
        title: "Analysis complete!",
        description: `Found ${data.topics.length} important topics in your syllabus.`,
      });
    } catch (error) {
      console.error("Error analyzing syllabus:", error);
      toast({
        title: "Analysis failed",
        description: "Failed to analyze syllabus. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in relative">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="absolute right-4 top-0"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-foreground">
            Syllabus Analyzer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload or describe your syllabus, and our AI will identify the most important topics for you to focus on.
          </p>
        </div>

        {step === "input" && (
          <div className="max-w-3xl mx-auto animate-slide-up">
            <Card className="p-8 shadow-card-custom">
              <h2 className="text-2xl font-semibold mb-6 text-center">
                How would you like to add your syllabus?
              </h2>

              {!inputMethod && (
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <Button
                    onClick={() => setInputMethod("upload")}
                    variant="outline"
                    className="h-32 flex flex-col gap-3 hover:border-primary transition-colors"
                  >
                    <Upload className="w-8 h-8 text-primary" />
                    <div>
                      <div className="font-semibold">Upload PDF</div>
                      <div className="text-sm text-muted-foreground">
                        Upload your syllabus file
                      </div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => setInputMethod("describe")}
                    variant="outline"
                    className="h-32 flex flex-col gap-3 hover:border-primary transition-colors"
                  >
                    <MessageSquare className="w-8 h-8 text-primary" />
                    <div>
                      <div className="font-semibold">Describe It</div>
                      <div className="text-sm text-muted-foreground">
                        Type or paste your syllabus
                      </div>
                    </div>
                  </Button>
                </div>
              )}

              {inputMethod === "upload" && (
                <FileUpload
                  onFileProcessed={(text) => setSyllabusText(text)}
                  onBack={() => setInputMethod(null)}
                />
              )}

              {inputMethod === "describe" && (
                <div className="space-y-4">
                  <Button
                    variant="ghost"
                    onClick={() => setInputMethod(null)}
                    className="mb-2"
                  >
                    ← Back
                  </Button>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Syllabus Title
                    </label>
                    <input
                      type="text"
                      value={syllabusTitle}
                      onChange={(e) => setSyllabusTitle(e.target.value)}
                      placeholder="e.g., Introduction to Computer Science"
                      className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Syllabus Content
                    </label>
                    <Textarea
                      value={syllabusText}
                      onChange={(e) => setSyllabusText(e.target.value)}
                      placeholder="Paste your syllabus content here..."
                      className="min-h-[300px] resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Syllabus"}
                  </Button>
                </div>
              )}

              {inputMethod === "upload" && syllabusText && (
                <div className="mt-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      Syllabus Title
                    </label>
                    <input
                      type="text"
                      value={syllabusTitle}
                      onChange={(e) => setSyllabusTitle(e.target.value)}
                      placeholder="e.g., Introduction to Computer Science"
                      className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Syllabus"}
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}

        {step === "topics" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <TopicsList topics={topics} />
            
            <div className="flex justify-center">
              <Button
                onClick={() => setStep("chat")}
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                Ask Questions About This Syllabus
              </Button>
            </div>
          </div>
        )}

        {step === "chat" && syllabusId && (
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => setStep("topics")}
              className="mb-4"
            >
              ← Back to Topics
            </Button>
            
            <ChatInterface syllabusId={syllabusId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;