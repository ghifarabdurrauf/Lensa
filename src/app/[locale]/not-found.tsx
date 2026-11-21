"use client";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { Empty } from "@/components/bits";

export default function NotFound() {
  const { t, locale } = useApp();
  return (
    <div className="page rise">
      <div className="g">
        <Empty icon="search" title="404" body={t.empty.filtered}
          action={<Link className="btn btn-pri" href={`/${locale}`}>{t.nav.home}</Link>} />
      </div>
    </div>
  );
}
