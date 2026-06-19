"use client";

import { useEffect, useState } from "react";
import { fetchNews, NewsItem } from "@/utils/fetchNews";
import NewsCard from "@/components/NewsCard";

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetchNews().then(setNews);
  }, []);

  return (
    <section className="py-12 px-6 max-w-5xl mx-auto">
      {/* Heading mit Oswald-Font gemäß Design-Spec */}
      <h2 className="text-2xl font-bold font-oswald mb-8 text-center">Vereins-News</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {news.map((item, index) => (
          <NewsCard key={item.id.toString()} item={item} index={index} />
        ))}
      </div>
    </section>
  );
}
