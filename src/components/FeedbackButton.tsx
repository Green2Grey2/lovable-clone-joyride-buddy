import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MessageSquare, Send, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export const FeedbackButton = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"bug" | "feature" | "general">("general");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const { playConfirm } = useSoundEffects();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_feedback')
        .insert({
          user_id: user?.id,
          type: feedbackType,
          rating,
          message: message.trim(),
          page_url: window.location.pathname,
          user_agent: navigator.userAgent
        });

      if (error) throw error;

      toast.success("Thank you for your feedback!");
      playConfirm();
      setOpen(false);
      setMessage("");
      setRating(5);
      setFeedbackType("general");
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error("Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Help us improve Joyride Buddy by sharing your thoughts
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Feedback Type</Label>
            <RadioGroup
              value={feedbackType}
              onValueChange={(value: any) => setFeedbackType(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bug" id="bug" />
                <Label htmlFor="bug">Bug Report</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="feature" id="feature" />
                <Label htmlFor="feature">Feature Request</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="general" id="general" />
                <Label htmlFor="general">General Feedback</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Your Feedback</Label>
            <Textarea
              id="message"
              placeholder={
                feedbackType === "bug"
                  ? "Please describe the issue you encountered..."
                  : feedbackType === "feature"
                  ? "What feature would you like to see?"
                  : "Share your thoughts with us..."
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !message.trim()}
            className="w-full"
          >
            {loading ? (
              "Sending..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Feedback
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};