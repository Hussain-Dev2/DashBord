# Answer
The problem was in the code: **`middleware.ts`**.

It caused a redirect loop.
**Fix:** I deleted `middleware.ts` and fixed a build error in `admin/page.tsx`.

Please **redeploy**.
