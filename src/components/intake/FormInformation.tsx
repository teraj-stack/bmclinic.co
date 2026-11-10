import type { IntakeForm } from "@/lib/intake/forms";
export default function FormInformation({
  information,
}: {
  information: NonNullable<IntakeForm["information"]>;
}) {
  return (
    <aside className="procedure-information" aria-label={information.title}>
      <h3>{information.title}</h3>
      {information.paragraphs.map((text) => (
        <p key={text}>{text}</p>
      ))}
    </aside>
  );
}
