import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import blog from "./mock-data/blog.json";
import news from "./mock-data/news.json";
import media from "./mock-data/media.json";
import review from "./mock-data/review.json";
import tools from "./mock-data/tools.json";
import download from "./mock-data/download.json";
import shop from "./mock-data/shop.json";
import forum from "./mock-data/forum.json";
import users from "./mock-data/users.json";
import comments from "./mock-data/comments.json";

const prisma = new PrismaClient();

async function main(){
  console.log("Seeding TechBox…");
  await prisma.commentVote.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const pw = await bcrypt.hash("techbox123", 10);
  for(const u of users as any[]){
    await prisma.user.create({
      data: {
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        role: u.role === "super_admin" ? "super_admin" : "editor",
        modules: JSON.stringify(u.modules),
        avatar: u.avatar || null,
        password: pw
      }
    });
  }

  const allPosts = [
    ...blog, ...news, ...media, ...review, ...tools, ...download, ...shop, ...forum
  ];

  for(const p of allPosts as any[]){
    await prisma.post.create({
      data: {
        slug: p.slug,
        module: p.module || "tools",
        title: p.title,
        excerpt: p.excerpt || "",
        content: p.content || p.excerpt || "",
        image: p.image || null,
        tags: JSON.stringify(p.tags || []),
        category: p.category || null,
        authorName: p.author?.name || "تحریریه",
        date: (p.date && !isNaN(Date.parse(p.date))) ? new Date(p.date) : new Date(),
        dateFa: p.date_fa || "۱ تیر ۱۴۰۵",
        likes: p.likes || 0,
        views: p.views || 0,
        published: true
      }
    });
  }

  // seed comments – map content_type+slug to postId
  for(const c of comments as any[]){
    const post = await prisma.post.findFirst({
      where: { module: c.content_type as any, slug: c.content_slug }
    });
    if(!post) continue;
    await prisma.comment.create({
      data: {
        postId: post.id,
        authorName: c.author || "کاربر",
        text: c.text,
        likes: c.likes || 0,
        dislikes: c.dislikes || 0,
        createdAt: (c.date && !isNaN(Date.parse(c.date))) ? new Date(c.date) : new Date()
      }
    });
  }

  console.log("Seed done");
}
main().finally(()=>prisma.$disconnect());
