# Momento AI via Supabase + OpenRouter

Website builds cannot ship `.env` keys. Use a Supabase Edge Function.

## 1. Create secret
```bash
supabase secrets set OPENROUTER_API_KEY=sk-or-v1-...
# optional:
supabase secrets set AI_MODEL=openai/gpt-4o-mini
```

## 2. Deploy
```bash
supabase functions deploy ai-plan
```

## 3. Client
The app calls:
`https://zfvaylgvhgmwmlpiwjzw.supabase.co/functions/v1/ai-plan`

with the anon key in `Authorization` / `apikey` headers.

## Local Electron
`music-server` still works with:
```
AI_API_KEY=sk-or-v1-...
AI_API_BASE=https://openrouter.ai/api/v1
AI_MODEL=openai/gpt-4o-mini
```
