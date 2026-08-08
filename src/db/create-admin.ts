import "dotenv/config";
import { createInterface } from "node:readline/promises";

import { pool } from "./index";
import { createUserFormSchema } from "../lib/validators/users";
import { createUser, findUserByLogin } from "../server/services/users";

/**
 * One-time bootstrap script for a fresh production database that has no
 * users yet. The application has no public sign-up — the very first admin
 * account has to be created from the server/container, after which all
 * further accounts are created from the "Пользователи" screen.
 *
 * Usage (interactive, recommended):
 *   npm run create-admin
 *
 * Usage (non-interactive, e.g. scripted deployment):
 *   npm run create-admin -- --full-name="Иван Иванов" --login=admin --password="StrongPass123"
 */

function readArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match?.slice(prefix.length);
}

async function promptMissing(values: {
  fullName?: string;
  login?: string;
  password?: string;
}) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const fullName = values.fullName ?? (await rl.question("ФИО администратора: "));
    const login = values.login ?? (await rl.question("Логин (латиницей): "));
    const password = values.password ?? (await rl.question("Пароль (минимум 8 символов): "));
    return { fullName, login, password };
  } finally {
    rl.close();
  }
}

async function main() {
  const argsProvided = readArg("full-name") && readArg("login") && readArg("password");

  const raw = argsProvided
    ? {
        fullName: readArg("full-name")!,
        login: readArg("login")!,
        password: readArg("password")!,
      }
    : await promptMissing({
        fullName: readArg("full-name"),
        login: readArg("login"),
        password: readArg("password"),
      });

  const parsed = createUserFormSchema.safeParse({ ...raw, role: "admin" });
  if (!parsed.success) {
    console.error("Проверьте введённые данные:");
    for (const issue of parsed.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exitCode = 1;
    return;
  }

  const existing = await findUserByLogin(parsed.data.login);
  if (existing) {
    console.error(
      `Пользователь с логином «${parsed.data.login}» уже существует. Управляйте учётными записями через раздел «Пользователи» в интерфейсе.`
    );
    process.exitCode = 1;
    return;
  }

  const admin = await createUser(parsed.data);
  console.log(`Администратор «${admin.fullName}» (логин: ${admin.login}) создан.`);
  console.log("Теперь можно войти в систему и создать остальных пользователей через раздел «Пользователи».");
}

main()
  .catch((err) => {
    console.error("Не удалось создать администратора:", err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
