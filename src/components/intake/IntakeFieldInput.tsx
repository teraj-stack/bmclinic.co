"use client";
import type { IntakeField } from "@/lib/intake/forms";
type Props = {
  field: IntakeField;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};
export default function IntakeFieldInput({
  field,
  value,
  onChange,
  disabled = false,
}: Props) {
  const id = "intake-" + field.id;
  const hint = field.hint ? id + "-hint" : undefined;
  function select(answer: string) {
    if (
      value.trim() &&
      value !== answer &&
      !field.quickAnswers?.includes(value) &&
      !window.confirm("Zastąpić wpisany przez Ciebie tekst gotową odpowiedzią?")
    )
      return;
    onChange(answer);
  }
  return (
    <div className="intake-field">
      <label htmlFor={id}>
        {field.label}
        {field.required ? " *" : ""}
      </label>
      {field.hint && (
        <p className="field-hint" id={hint}>
          {field.hint}
        </p>
      )}
      {field.buttons && field.options && (
        <div
          id={id}
          tabIndex={-1}
          className="quick-answers"
          role="group"
          aria-label={field.label}
        >
          {field.options.map((answer) => (
            <button
              type="button"
              key={answer}
              disabled={disabled}
              aria-pressed={value === answer}
              onClick={() => onChange(answer)}
            >
              {answer}
            </button>
          ))}
        </div>
      )}
      {field.quickAnswers && (
        <div
          className="quick-answers"
          role="group"
          aria-label={"Gotowe odpowiedzi: " + field.label}
        >
          {field.quickAnswers.map((answer) => (
            <button
              key={answer}
              type="button"
              aria-pressed={value === answer}
              disabled={disabled}
              onClick={() => select(answer)}
            >
              {answer}
            </button>
          ))}
          <button
            type="button"
            disabled={disabled}
            onClick={() => document.getElementById(id)?.focus()}
          >
            Wpiszę szczegóły
          </button>
        </div>
      )}
      {field.buttons ? null : field.type === "textarea" ? (
        <textarea
          id={id}
          rows={3}
          maxLength={2500}
          autoComplete="off"
          aria-describedby={hint}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === "choice" ? (
        <select
          id={id}
          aria-describedby={hint}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Wybierz lub pozostaw puste</option>
          {field.options?.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={field.type ?? "text"}
          maxLength={2500}
          autoComplete="off"
          aria-describedby={hint}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
