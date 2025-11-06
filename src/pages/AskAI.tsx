import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardNav } from "@/components/DashboardNav";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, Send, FileText, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ fileName: string; text: string }>;
}

interface Document {
  id: string;
  file_name: string;
  file_size: number;
  upload_date: string;
}

export default function AskAI() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [enrollmentNumber, setEnrollmentNumber] = useState("");

  useEffect(() => {
    const studentProfile = localStorage.getItem('studentProfile');
    if (!studentProfile) {
      navigate('/auth');
      return;
    }

    const profile = JSON.parse(studentProfile);
    setEnrollmentNumber(profile.enrollment_number);
    loadDocuments(profile.enrollment_number);
  }, [navigate]);

  const loadDocuments = async (enrollment: string) => {
    try {
      const { data, error } = await supabase
        .from('study_documents')
        .select('*')
        .eq('enrollment_number', enrollment)
        .order('upload_date', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
      toast({
        title: "Invalid File",
        description: "Please upload PDF or text files only",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const studentProfile = JSON.parse(localStorage.getItem('studentProfile') || '{}');
      const filePath = `${enrollmentNumber}/${Date.now()}_${file.name}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('study-materials')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create document record
      const { data: docData, error: docError } = await supabase
        .from('study_documents')
        .insert({
          student_id: studentProfile.id,
          enrollment_number: enrollmentNumber,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size
        })
        .select()
        .single();

      if (docError) throw docError;

      // Process document (extract text, chunk, embed)
      const { error: processError } = await supabase.functions.invoke('process-document', {
        body: {
          fileUrl: filePath,
          fileName: file.name,
          enrollmentNumber,
          studentId: studentProfile.id,
          documentId: docData.id
        }
      });

      if (processError) throw processError;

      toast({
        title: "Success",
        description: "Document uploaded and processed successfully!"
      });

      loadDocuments(enrollmentNumber);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload document",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (doc: Document) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('study-materials')
        .remove([doc.file_name]);

      if (storageError) throw storageError;

      // Delete from database (chunks will be deleted via CASCADE)
      const { error: dbError } = await supabase
        .from('study_documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      toast({
        title: "Deleted",
        description: "Document deleted successfully"
      });

      loadDocuments(enrollmentNumber);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive"
      });
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    const userMessage: Message = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setQuestion("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ask-ai', {
        body: { question, enrollmentNumber }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Ask AI error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to get answer",
        variant: "destructive"
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I couldn't process your question. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <DashboardNav />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Ask AI Assistant
            </h1>
            <p className="text-muted-foreground">
              Upload your notes and ask questions in English or Hinglish
            </p>
          </div>

          {/* Upload Section */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Your Study Materials
                </h2>
                <label htmlFor="file-upload">
                  <Button disabled={isUploading} asChild>
                    <span className="cursor-pointer">
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Upload PDF/Text
                        </>
                      )}
                    </span>
                  </Button>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <div className="grid gap-2">
                {documents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No documents uploaded yet. Upload your notes to get started!
                  </p>
                ) : (
                  documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">{doc.file_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(doc.file_size / 1024).toFixed(2)} KB • {new Date(doc.upload_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>

          {/* Chat Section */}
          <Card className="p-6 min-h-[400px] flex flex-col">
            <div className="flex-1 space-y-4 mb-4 overflow-y-auto max-h-[500px]">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg mb-2">👋 Hello! Ask me anything from your notes</p>
                  <p className="text-sm">Example: "What are the key features of React?"</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-4 ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <p className="text-xs font-semibold mb-2">Sources:</p>
                          {msg.sources.map((source, i) => (
                            <p key={i} className="text-xs opacity-80 mb-1">
                              📄 {source.fileName}: {source.text}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-4">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleAskQuestion()}
                placeholder="Ask your question... (English या Hinglish me)"
                disabled={isLoading || documents.length === 0}
              />
              <Button 
                onClick={handleAskQuestion}
                disabled={isLoading || !question.trim() || documents.length === 0}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}