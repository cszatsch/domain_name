import { describe, expect, it } from "vitest";

import {
  buildDomains,
  isValidLabel,
  normalizeTerm,
  tldOf,
  MAX_LABEL_LENGTH,
} from "@/lib/domain-utils";
import { TLDS } from "@/lib/tlds";

describe("normalizeTerm", () => {
  it("met en minuscules et remplace les espaces par des tirets", () => {
    expect(normalizeTerm("My Brand")).toBe("my-brand");
  });

  it("supprime les accents", () => {
    expect(normalizeTerm("Crème Brûlée")).toBe("creme-brulee");
    expect(normalizeTerm("déjà-vu")).toBe("deja-vu");
  });

  it("traite underscores et points comme séparateurs", () => {
    expect(normalizeTerm("my_brand.io")).toBe("my-brand-io");
  });

  it("supprime les caractères invalides", () => {
    expect(normalizeTerm("hello@world!")).toBe("helloworld");
  });

  it("retire les tirets en bordure et les doublons", () => {
    expect(normalizeTerm("--a---b--")).toBe("a-b");
  });

  it("tronque à la longueur maximale d'un label", () => {
    expect(normalizeTerm("a".repeat(100))).toHaveLength(MAX_LABEL_LENGTH);
  });

  it("retourne une chaîne vide si rien d'exploitable", () => {
    expect(normalizeTerm("!!!")).toBe("");
    expect(normalizeTerm("   ")).toBe("");
  });
});

describe("isValidLabel", () => {
  it("accepte les labels valides", () => {
    expect(isValidLabel("hello")).toBe(true);
    expect(isValidLabel("a-b-c")).toBe(true);
    expect(isValidLabel("abc123")).toBe(true);
  });

  it("rejette les labels vides ou mal formés", () => {
    expect(isValidLabel("")).toBe(false);
    expect(isValidLabel("-ab")).toBe(false);
    expect(isValidLabel("ab-")).toBe(false);
  });
});

describe("buildDomains", () => {
  it("génère un domaine par extension", () => {
    const domains = buildDomains("test", TLDS);
    expect(domains).toHaveLength(TLDS.length);
    expect(domains).toContain("test.com");
    expect(domains).toContain("test.fr");
  });
});

describe("tldOf", () => {
  it("extrait la dernière étiquette", () => {
    expect(tldOf("test.com")).toBe("com");
    expect(tldOf("a.b.io")).toBe("io");
  });

  it("retourne une chaîne vide sans point", () => {
    expect(tldOf("nodot")).toBe("");
  });
});
