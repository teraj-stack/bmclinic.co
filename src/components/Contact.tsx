import { departmentById } from "@/lib/departments";
export default function Contact({ department }: { department?: string }) {
  const d = department ? departmentById(department) : undefined;
  const phone = process.env.CLINIC_PHONE,
    email = process.env.CLINIC_EMAIL,
    address = process.env.CLINIC_ADDRESS;
  return (
    <main id="main" className={d ? "department-page " + d.theme : ""}>
      <div className="section reading">
        <p className="eyebrow">BM CLINIC · KONTAKT</p>
        <h1>Porozmawiajmy o Twojej wizycie.</h1>
        <div className="contact-grid">
          {phone && (
            <p>
              <b>Telefon</b>
              <br />
              <a href={"tel:" + phone.replace(/[^+0-9]/g, "")}>{phone}</a>
            </p>
          )}
          {email && (
            <p>
              <b>E-mail</b>
              <br />
              <a href={"mailto:" + email}>{email}</a>
            </p>
          )}
          {address && (
            <p>
              <b>Rzeczywisty adres placówki</b>
              <br />
              {address}
            </p>
          )}
        </div>
        {!phone && !email && !address && (
          <p>
            Dane kontaktowe zostaną udostępnione po ich potwierdzeniu przez
            klinikę.
          </p>
        )}
        <p className="fine">
          Widok Sky Lobby przedstawia wirtualną przestrzeń marki. Nie jest
          zdjęciem rzeczywistej lokalizacji placówki.
        </p>
      </div>
    </main>
  );
}
