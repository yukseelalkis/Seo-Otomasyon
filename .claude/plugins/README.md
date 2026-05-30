# .claude/plugins/

> 2026'da Claude Code'da plugin'ler **first-class** hâle geldi: agent + command + hook +
> skill + MCP demetlerini tek paket olarak kurma/paylaşma yolu.

## Şu an boş — neden?

Bu proje **tek geliştirici, tek repo**. Plugin'in faydası, aynı yetenek setini birden
fazla projeye/ekibe taşımaktır. Tek repoda agent/command/hook'u doğrudan `.claude/`
altında tutmak yeterli.

## Ne zaman buraya geç?

Üç durumdan biri olursa:

1. **İkinci proje** — aynı setini başka bir repoda da kullanman gerek.
2. **Paylaşım** — birisiyle ortak yetenek setini paylaşıp birlikte güncellemek istiyorsun.
3. **Marketplace** — Anthropic'in resmi plugin marketplace'inden bir paket kuracaksın.

## İskelet (referans, ileride kullanmak için)

```
.claude/plugins/
└── seo-otomasyon-toolkit/
    └── plugin.json
```

`plugin.json` örnek:

```json
{
  "name": "seo-otomasyon-toolkit",
  "version": "0.1.0",
  "description": "IdeaSoft SEO/GEO içerik motoru için agents + commands + hooks + skills",
  "author": "yukseelalkis",
  "agents": [
    "code-reviewer",
    "security-auditor",
    "debugger",
    "urun-aciklama-incelemecisi"
  ],
  "commands": ["commit", "faz0-status", "review-product"],
  "hooks": ["format-on-save", "block-dangerous-bash", "protect-env"],
  "skills": ["seo-expert", "urun-aciklama-uretici"],
  "mcp_servers": []
}
```

## Şimdilik yapma

Faz 1/2 bitsin, motor olgunlaşsın, sonra paketle. Erken paketleme = sürekli yeniden paketleme.
