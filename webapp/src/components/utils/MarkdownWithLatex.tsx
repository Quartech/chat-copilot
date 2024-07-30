import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkSupersub from 'remark-supersub';
import 'katex/dist/katex.min.css'; // Import KaTeX CSS for styling

interface MarkdownWithLatexProps {
    markdownText: string;
}

const MarkdownWithLatex: React.FC<MarkdownWithLatexProps> = ({ markdownText }) => {
  const preprocessMarkdown = (text: string): string => {
      // Escape dollar signs that are not part of LaTeX math
      let processedText = text.replace(/([^\\])\$/g, '$1\\$');

      // Replace \[ with $$ and \] with $$ to ensure compatibility
      processedText = processedText
          .replace(/\\\[/g, '$$$') // Replace all occurrences of \[ with $$
          .replace(/\\\]/g, '$$$') // Replace all occurrences of \] with $$
          .replace(/\\\(/g, '$$') // Replace all occurrences of \( with $$
          .replace(/\\\)/g, '$$'); // Replace all occurrences of \) with $$

      // Replace single dollar signs used for LaTeX math with double dollar signs
      processedText = processedText.replace(/(?<!\\)\$(?!\$)(.*?)(?<!\\)\$/g, '$$$$ $1 $$$$');

      return processedText;
  };

    const remarkMathOptions = {
        singleDollarTextMath: false,
    };

    return (
        <ReactMarkdown
            className="markdown-content"
            remarkPlugins={[[remarkMath, remarkMathOptions], remarkGfm, remarkSupersub]} // Include existing plugins
            rehypePlugins={[rehypeRaw, rehypeKatex]} // Include rehypeRaw for HTML, rehypeKatex for LaTeX
        >
            {preprocessMarkdown(markdownText)}
        </ReactMarkdown>
    );
};

export default MarkdownWithLatex;
