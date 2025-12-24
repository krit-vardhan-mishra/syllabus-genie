import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";

interface FileUploadProps {
  onFileProcessed: (text: string) => void;
  onBack: () => void;
}

const FileUpload = ({ onFileProcessed, onBack }: FileUploadProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState("");
  const { toast } = useToast();

  // Configure PDF.js worker - use local worker from node_modules
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    try {
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = "";

        // Extract text from all pages
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(" ");
          fullText += pageText + "\n";
        }

        if (fullText.trim().length > 50) {
          onFileProcessed(fullText.trim());
          toast({
            title: "PDF processed successfully!",
            description: "You can now analyze your syllabus.",
          });
        } else {
          throw new Error("Could not extract sufficient text from PDF");
        }
      } else if (file.type === "text/plain") {
        const text = await file.text();
        onFileProcessed(text);
        toast({
          title: "File uploaded successfully!",
          description: "You can now analyze your syllabus.",
        });
      } else {
        throw new Error("Please upload a PDF or text file");
      }
    } catch (error) {
      console.error("File upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive",
      });
      setFileName("");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        ← Back
      </Button>

      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
        <input
          type="file"
          accept=".pdf,.txt"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
          disabled={isProcessing}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center gap-3"
        >
          {fileName ? (
            <>
              <FileText className="w-12 h-12 text-primary" />
              <div>
                <p className="font-medium">{fileName}</p>
                <p className="text-sm text-muted-foreground">
                  {isProcessing ? "Processing..." : "Click to change file"}
                </p>
              </div>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-muted-foreground" />
              <div>
                <p className="font-medium">Click to upload</p>
                <p className="text-sm text-muted-foreground">
                  PDF or TXT files accepted
                </p>
              </div>
            </>
          )}
        </label>
      </div>
    </div>
  );
};

export default FileUpload;