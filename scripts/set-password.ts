import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setPassword(email: string, newPassword: string) {
  console.log(`Đang tìm tài khoản ${email}...`);
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error("Lỗi khi tìm user:", listError);
    process.exit(1);
  }

  const user = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) {
    console.error(`Không tìm thấy user với email: ${email}`);
    process.exit(1);
  }

  console.log(`Tìm thấy user ID: ${user.id}. Đang cập nhật mật khẩu...`);
  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
    email_confirm: true,
  });

  if (updateError) {
    console.error("Lỗi khi cập nhật mật khẩu:", updateError);
    process.exit(1);
  }

  console.log(`✅ Cập nhật mật khẩu thành công cho tài khoản ${email}!`);
}

const targetEmail = process.argv[2] || "nhutminh1989@gmail.com";
const targetPassword = process.argv[3];

if (!targetPassword) {
  console.log("Cách dùng: npx tsx scripts/set-password.ts <email> <mat_khau_moi>");
  console.log("Ví dụ: npx tsx scripts/set-password.ts nhutminh1989@gmail.com matkhau123");
  process.exit(1);
}

setPassword(targetEmail, targetPassword);

