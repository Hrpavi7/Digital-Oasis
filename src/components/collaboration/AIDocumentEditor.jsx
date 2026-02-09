import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, FileText, CheckCircle, Loader2, Copy, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIDocumentEditor({ content, onContentUpdate }) {
  const [selectedText, setSelectedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [tone, setTone] = useState("professional");

  const summarizeDocument = async () => {
    setIsProcessing(true);
    setResult(null);

    try {
      const prompt = `Summarize the following document in a concise manner (100-150 words):

${content}

Provide a clear, comprehensive summary that captures the main points.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false,
      });

      setResult({ type: "summary", content: response });
    } catch (error) {
      console.error("Error summarizing:", error);
    }

    setIsProcessing(false);
  };

  const checkGrammar = async () => {
    setIsProcessing(true);
    setResult(null);

    try {
      const textToCheck = selectedText || content;

      const prompt = `Check the following text for grammar and spelling errors. Provide the corrected version and list the corrections made.

Text:
${textToCheck}

Return JSON:
{
  "corrected_text": "corrected version",
  "corrections": ["list of corrections made"]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            corrected_text: { type: "string" },
            corrections: { type: "array", items: { type: "string" } },
          },
        },
      });

      setResult({ type: "grammar", content: response });
    } catch (error) {
      console.error("Error checking grammar:", error);
    }

    setIsProcessing(false);
  };

  const rephraseText = async () => {
    setIsProcessing(true);
    setResult(null);

    try {
      const textToRephrase = selectedText || content;

      const prompt = `Rephrase the following text for better clarity and conciseness while maintaining the original meaning:

${textToRephrase}

Make it clear, concise, and easy to understand. Keep the same general length.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false,
      });

      setResult({ type: "rephrase", content: response });
    } catch (error) {
      console.error("Error rephrasing:", error);
    }

    setIsProcessing(false);
  };

  const adjustTone = async () => {
    setIsProcessing(true);
    setResult(null);

    try {
      const textToAdjust = selectedText || content;

      const prompt = `Adjust the tone of the following text to be ${tone}:

${textToAdjust}

Maintain the core message but adjust the language, word choice, and style to match the ${tone} tone.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false,
      });

      setResult({ type: "tone", content: response });
    } catch (error) {
      console.error("Error adjusting tone:", error);
    }

    setIsProcessing(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const applyChanges = () => {
    if (result?.type === "grammar" && result.content.corrected_text) {
      onContentUpdate(result.content.corrected_text);
    } else if (result?.type === "rephrase" || result?.type === "tone") {
      onContentUpdate(result.content);
    }
    setResult(null);
  };

  return (
    <Card className="border-none shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Document Editor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="summarize" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summarize">Summarize</TabsTrigger>
            <TabsTrigger value="grammar">Grammar</TabsTrigger>
            <TabsTrigger value="rephrase">Rephrase</TabsTrigger>
            <TabsTrigger value="tone">Tone</TabsTrigger>
          </TabsList>

          <TabsContent value="summarize" className="space-y-3 mt-4">
            <p className="text-sm text-gray-600">
              Generate a concise summary of your document
            </p>
            <Button
              onClick={summarizeDocument}
              disabled={isProcessing || !content}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Summarizing...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Summarize Document
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="grammar" className="space-y-3 mt-4">
            <div>
              <label className="text-sm text-gray-600 mb-2 block">
                Select text to check (or leave empty to check entire document)
              </label>
              <Textarea
                value={selectedText}
                onChange={(e) => setSelectedText(e.target.value)}
                placeholder="Paste text here or leave empty to check full document..."
                rows={3}
              />
            </div>
            <Button
              onClick={checkGrammar}
              disabled={isProcessing || !content}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Check Grammar & Spelling
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="rephrase" className="space-y-3 mt-4">
            <div>
              <label className="text-sm text-gray-600 mb-2 block">
                Select text to rephrase (or leave empty to rephrase entire
                document)
              </label>
              <Textarea
                value={selectedText}
                onChange={(e) => setSelectedText(e.target.value)}
                placeholder="Paste text here or leave empty to rephrase full document..."
                rows={3}
              />
            </div>
            <Button
              onClick={rephraseText}
              disabled={isProcessing || !content}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rephrasing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Rephrase for Clarity
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="tone" className="space-y-3 mt-4">
            <div>
              <label className="text-sm text-gray-600 mb-2 block">
                Select text to adjust (or leave empty to adjust entire document)
              </label>
              <Textarea
                value={selectedText}
                onChange={(e) => setSelectedText(e.target.value)}
                placeholder="Paste text here or leave empty to adjust full document..."
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Target Tone
              </label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={adjustTone}
              disabled={isProcessing || !content}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adjusting Tone...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Adjust Tone
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white border-2 border-purple-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-600 text-white">
                        {result.type === "summary" && "Summary"}
                        {result.type === "grammar" && "Grammar Check"}
                        {result.type === "rephrase" && "Rephrased"}
                        {result.type === "tone" && "Tone Adjusted"}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          result.type === "grammar"
                            ? result.content.corrected_text
                            : result.content,
                        )
                      }
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.type === "grammar" && result.content.corrections && (
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Corrections Made:
                      </h4>
                      <ul className="space-y-1">
                        {result.content.corrections.map((correction, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-green-700 flex items-start gap-2"
                          >
                            <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {correction}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {result.type === "grammar"
                        ? result.content.corrected_text
                        : result.content}
                    </p>
                  </div>
                  {result.type !== "summary" && (
                    <Button
                      onClick={applyChanges}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Apply Changes
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
