import Image from "next/image";
import type { CmsMediaAsset, ContactPageContent } from "@fs/cms-contracts";
import { ContactEnquiryForm } from "./contact-enquiry-form";
import styles from "./contact-page.module.css";

type ContactPageExperienceProps = {
  content: ContactPageContent;
  image: CmsMediaAsset | null;
  imageAlt: string;
  email: string;
  phone: string;
};

function toTelephoneHref(phone: string): string {
  return phone.replace(/[^+\d]/g, "");
}

export function ContactPageExperience({
  content,
  image,
  imageAlt,
  email,
  phone,
}: ContactPageExperienceProps) {
  const publicEmail = email.trim();
  const publicPhone = phone.trim();
  const telephoneHref = toTelephoneHref(publicPhone);

  return (
    <main aria-labelledby="contact-page-heading" className={styles.page}>
      <div className="storefront-shell">
        <div className={styles.layout}>
          <div className={styles.introColumn}>
            <div className={styles.introCopy}>
              <p className="type-caption text-muted-foreground">{content.eyebrow}</p>
              <h1 className={`type-page-heading ${styles.heading}`} id="contact-page-heading">
                {content.heading}
              </h1>
              <p className={`type-subheading ${styles.description}`}>{content.description}</p>
            </div>

            {image ? (
              <figure className={`${styles.photoFrame} editorial-image`}>
                <Image
                  alt={imageAlt}
                  fetchPriority="high"
                  fill
                  loading="eager"
                  sizes="(max-width: 68rem) 100vw, 42vw"
                  src={image.url}
                />
              </figure>
            ) : null}

            {publicEmail || publicPhone ? (
              <address aria-label="Contact details" className={styles.contactDetails}>
                {publicEmail ? (
                  <div className={styles.contactMethod}>
                    <span className="type-caption text-muted-foreground">Email</span>
                    <a className={styles.contactLink} href={`mailto:${publicEmail}`}>
                      {publicEmail}
                    </a>
                  </div>
                ) : null}
                {publicPhone ? (
                  <div className={styles.contactMethod}>
                    <span className="type-caption text-muted-foreground">Phone</span>
                    {telephoneHref ? (
                      <a className={styles.contactLink} href={`tel:${telephoneHref}`}>
                        {publicPhone}
                      </a>
                    ) : (
                      <span className={styles.contactValue}>{publicPhone}</span>
                    )}
                  </div>
                ) : null}
              </address>
            ) : null}
          </div>

          <ContactEnquiryForm content={content} email={publicEmail} phone={publicPhone} />
        </div>
      </div>
    </main>
  );
}
