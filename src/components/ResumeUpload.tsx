import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDropzone } from "react-dropzone";
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

interface ResumeUploadProps {
  onResumeUploaded?: (resumeUrl: string) => void;
  currentResume?: string;
}

const ResumeUpload = ({ onResumeUploaded, currentResume }: ResumeUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(currentResume || null);

  // Extract text from PDF in-browser for accurate parsing
  const extractPdfText = useCallback(async (file: File): Promise<string> => {
    try {
      GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.7.76/pdf.worker.min.js";
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await (getDocument({ data: arrayBuffer }) as any).promise;
      let text = "";
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const strings = (content.items as any[]).map((item: any) =>
          typeof item?.str === "string" ? item.str : ""
        );
        text += strings.join(" ") + "\n";
      }
      return text;
    } catch (err) {
      console.error("PDF text extraction failed", err);
      return "";
    }
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) return;

    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOC, DOCX, or TXT file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/resume.${fileExt}`;
      
      // Delete existing resume if it exists
      if (resumeUrl) {
        const existingPath = resumeUrl.split('/').pop();
        if (existingPath) {
          await supabase.storage.from('resumes').remove([`${user.id}/${existingPath}`]);
        }
      }

      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(fileName, file, {
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(data.path);

      setResumeUrl(publicUrl);
      onResumeUploaded?.(publicUrl);

      // Invoke resume parsing to inform the user (sending raw text when available)
      try {
        let rawContent = '';
        if (file.type === 'application/pdf') {
          rawContent = await extractPdfText(file);
        } else if (file.type.startsWith('text/')) {
          rawContent = await file.text();
        }
        const { data: parsed, error: parseError } = await supabase.functions.invoke('parse-resume', {
          body: { resumeUrl: publicUrl, rawContent }
        });
        if (parseError) throw parseError;
        const summary = parsed?.summary || 'Your resume was parsed successfully.';
        const skillsCount = parsed?.analysis?.skills?.length ?? 0;
        const companiesCount = parsed?.analysis?.companies?.length ?? 0;
        toast({
          title: 'Resume parsed',
          description: `${summary} Found ${skillsCount} skills and ${companiesCount} companies.`,
        });
      } catch (e: any) {
        console.warn('Resume parse function failed:', e?.message || e);
        toast({
          title: 'Resume uploaded successfully',
          description: 'We will tailor questions to your resume.',
        });
      }
    } catch (error: any) {
      console.error('Error uploading resume:', error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [user, toast, onResumeUploaded, resumeUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: false,
    disabled: uploading
  });

  const deleteResume = async () => {
    if (!user || !resumeUrl) return;

    try {
      const path = resumeUrl.split('/').slice(-2).join('/'); // Get user_id/filename
      const { error } = await supabase.storage
        .from('resumes')
        .remove([path]);

      if (error) throw error;

      setResumeUrl(null);
      onResumeUploaded?.('');

      toast({
        title: "Resume deleted",
        description: "Your resume has been removed",
      });
    } catch (error: any) {
      console.error('Error deleting resume:', error);
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const viewResume = () => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Resume Upload
        </CardTitle>
        <CardDescription>
          Upload your resume to get personalized interview questions based on your experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!resumeUrl ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              {uploading ? 'Uploading...' : 'Drop your resume here'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse files
            </p>
            <p className="text-xs text-muted-foreground">
              Supports PDF, DOC, DOCX, TXT (max 5MB)
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">Resume uploaded</p>
                <p className="text-sm text-muted-foreground">
                  Ready for personalized interview questions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={viewResume}
                className="h-9"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={deleteResume}
                className="h-9 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeUpload;