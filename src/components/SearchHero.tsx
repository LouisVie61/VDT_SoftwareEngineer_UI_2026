import { Loader2, Play, RotateCcw, Search, X } from "lucide-react";
import { exampleQueries } from "../data/examples";

interface SearchHeroProps {
  question: string;
  isLoading: boolean;
  onQuestionChange: (question: string) => void;
  onSubmit: () => void;
  onClear: () => void;
}

export function SearchHero({ question, isLoading, onQuestionChange, onSubmit, onClear }: SearchHeroProps) {
  return (
    <section className="search-hero" id="search">
      <h1>Ask anything about your security events</h1>
      <p>Use natural language to search, analyze and investigate events.</p>
      <form
        className="search-box"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Search size={19} />
        <input
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          placeholder="Đếm số lần login thất bại theo từng user trong 7 ngày qua"
        />
        {question ? (
          <button className="ghost-icon" type="button" onClick={onClear} aria-label="Clear query">
            <X size={17} />
          </button>
        ) : null}
        <button className="primary-button search-submit" type="submit" disabled={isLoading || !question.trim()} aria-label="Run search">
          {isLoading ? <Loader2 className="spin" size={17} /> : <Play size={17} />}
        </button>
      </form>
      <div className="examples">
        <span>Suggestions:</span>
        {exampleQueries.map((query) => (
          <button key={query} type="button" onClick={() => onQuestionChange(query)}>
            {query}
          </button>
        ))}
        <button className="round-chip" type="button" onClick={() => onQuestionChange(exampleQueries[0])}>
          <RotateCcw size={15} />
        </button>
      </div>
    </section>
  );
}
