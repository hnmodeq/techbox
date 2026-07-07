import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const BLOB = "https://gasy0aqpxehqiy8d.public.blob.vercel-storage.com";
const PASSWORD = "123456xX";
const ALL_MODULES = ["blog", "news", "media", "review", "download", "shop", "forum", "tools"];

type SeedUser = {
  username: string;
  name: string;
  role: "super_admin" | "editor" | "user";
  roleFa: string;
  modules?: string[];
  avatar: string;
  job?: string;
};

export const seedUsers: SeedUser[] = [
  { username: "hoomanmodeq", name: "هومن مدق", role: "super_admin", roleFa: "مدیر کل", modules: ALL_MODULES, avatar: `${BLOB}/avatars/hoomanmodeq.jpg`, job: "مدیر تکباکس" },
  { username: "atiyehatami", name: "عطیه حاتمی", role: "editor", roleFa: "ادمین محتوا", modules: ["blog", "news"], avatar: `${BLOB}/avatars/atiyehatami.jpg`, job: "نویسنده مقاله" },
  { username: "behnazghaderi", name: "بهناز قادری", role: "editor", roleFa: "ادمین محتوا", modules: ["blog", "news"], avatar: `${BLOB}/avatars/behnazghaderi.jpg`, job: "نویسنده مقاله" },
  { username: "behruzghaderi", name: "بهروز قادری", role: "editor", roleFa: "ادمین محتوا", modules: ["blog", "news"], avatar: `${BLOB}/avatars/behruzghaderi.jpg`, job: "نویسنده مقاله" },
  { username: "nastarankhodakarami", name: "نسترن خداکرمی", role: "editor", roleFa: "نویسنده نقد", modules: ["review"], avatar: `${BLOB}/avatars/nastarankhodakarami.jpg`, job: "نویسنده نقد و بررسی" },
  { username: "farazfeizi", name: "فراز فیضی", role: "editor", roleFa: "نویسنده نقد", modules: ["review"], avatar: `${BLOB}/avatars/farazfeizi.jpg`, job: "نویسنده نقد و بررسی" },
  { username: "mostafanajafi", name: "مصطفی نجفی", role: "editor", roleFa: "نویسنده نقد", modules: ["review"], avatar: `${BLOB}/avatars/mostafanajafi.jpg`, job: "نویسنده نقد و بررسی" },
  { username: "panizbagheri", name: "پانیز باقری", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/panizbagheri.jpg`, job: "عضو انجمن" },
  { username: "shaghayeghrastegaar", name: "شقایق رستگار", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/shaghayeghrastegaar.jpg`, job: "عضو انجمن" },
  { username: "faridfeizi", name: "فرید فیضی", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/faridfeizi.jpg`, job: "عضو انجمن" },
  { username: "alirastegaar", name: "علی رستگار", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/alirastegaar.jpg` },
  { username: "amiralmasi", name: "امیر الماسی", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/amiralmasi.jpg` },
  { username: "aylingharagozloo", name: "آیلین قره‌گزلو", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/aylingharagozloo.jpg` },
  { username: "faribarastegaar", name: "فریبا رستگار", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/faribarastegaar.jpg` },
  { username: "fatamehrastegaar", name: "فاطمه رستگار", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/fatamehrastegaar.jpg` },
  { username: "hannamasoumy", name: "هانا معصومی", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/hannamasoumy.jpg` },
  { username: "mohsenakbari", name: "محسن اکبری", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/mohsenakbari.jpg` },
  { username: "mohsenshafaat", name: "محسن شفاعت", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/mohsenshafaat.jpg` },
  { username: "nazaninrastegaar", name: "نازنین رستگار", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/nazaninrastegaar.jpg` },
  { username: "parsaghahremanpoor", name: "پارسا قهرمان‌پور", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/parsaghahremanpoor.jpg` },
  { username: "pouryamodeq", name: "پوریا مدق", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/pouryamodeq.jpg` },
  { username: "raminrastegaar", name: "رامین رستگار", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/raminrastegaar.jpg` },
];

async function upsertUsers() {
  const password = await bcrypt.hash(PASSWORD, 10);
  for (const user of seedUsers) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: {
        name: user.name,
        email: `${user.username}@techbox.local`,
        role: user.role,
        roleFa: user.roleFa,
        job: user.job || null,
        modules: JSON.stringify(user.modules || []),
        avatar: user.avatar,
      },
      create: {
        name: user.name,
        username: user.username,
        email: `${user.username}@techbox.local`,
        role: user.role,
        roleFa: user.roleFa,
        job: user.job || null,
        modules: JSON.stringify(user.modules || []),
        avatar: user.avatar,
        password,
      },
    });
  }
  console.log(`Upserted ${seedUsers.length} real users. Password for all: ${PASSWORD}`);
}

async function main() {
  const stepArg = process.argv.find((arg) => arg.startsWith("--step="));
  const step = stepArg?.split("=")[1] || "all";
  if (step === "0" || step === "users" || step === "all") await upsertUsers();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
