import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ServiceCatalogueItem } from "@fs/cms-contracts";
import motionStyles from "./service-card-motion.module.css";

type ServiceCardProps = {
  item: ServiceCatalogueItem;
  position: number;
};

export function ServiceCard({ item, position }: ServiceCardProps) {
  const destination = item.destinationUrl.trim();
  const card = (
    <article
      className={`group min-w-0 border-t border-border pt-5 ${position === 0 ? motionStyles.firstCard : position === 1 ? motionStyles.secondCard : ""} ${destination ? "transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0" : ""}`}
    >
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-stretch lg:gap-6">
        <div className="editorial-image relative aspect-[1.14] bg-muted lg:aspect-auto lg:min-h-72">
          {item.image?.url ? (
            <Image
              alt={item.imageAlt}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
              fill
              sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 25vw, 100vw"
              src={item.image.url}
            />
          ) : (
            <div aria-hidden="true" className="grid size-full place-items-center bg-secondary/25">
              <span className="type-section-display text-primary/75">
                {item.title.trim().charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-col justify-between gap-6 py-1 lg:py-3">
          <div className="space-y-4">
            <p className="type-caption text-muted-foreground">
              {String(position + 1).padStart(2, "0")}
            </p>
            <h3 className="font-display text-3xl leading-tight tracking-[-0.035em]">
              {item.title}
            </h3>
            <p className="text-base leading-7 text-foreground">{item.shortDescription}</p>
            {item.detailedDescription.trim() ? (
              <p className="text-sm leading-6 text-muted-foreground">{item.detailedDescription}</p>
            ) : null}
          </div>
          {destination ? (
            <ArrowUpRight
              aria-hidden="true"
              className="size-5 self-end transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
            />
          ) : null}
        </div>
      </div>
    </article>
  );

  if (!destination) return card;

  const linkClassName =
    "block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4";
  if (/^https:\/\//i.test(destination)) {
    return (
      <a className={linkClassName} href={destination}>
        {card}
      </a>
    );
  }
  return (
    <Link className={linkClassName} href={destination}>
      {card}
    </Link>
  );
}
