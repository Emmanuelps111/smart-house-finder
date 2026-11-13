import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "MakaziLink · Find a home in Tanzania" },
    { name: "description", content: "Find rentals and student housing with MakaziLink in Tanzania." },
    { property: "og:title", content: "MakaziLink · Find a home in Tanzania" },
    { property: "og:description", content: "Find rentals and student housing with MakaziLink in Tanzania." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Index,
});

function Index() {
  useEffect(() => {
    window.location.replace("/home.html");
  }, []);
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui" }}>
      <p>Loading MakaziLink…</p>
    </div>
  );
}
