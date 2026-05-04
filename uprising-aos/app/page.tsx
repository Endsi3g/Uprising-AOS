import { PrismaHero } from "@/components/ui/prisma-hero";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/os");
  }

  return (
    <main className="min-h-screen bg-black">
      <PrismaHero />
    </main>
  );
}
