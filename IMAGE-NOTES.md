# Image notes

These four images were generated using the built-in image-generation tool for this demonstration. They are illustrative sample products, not photographs of verified sale inventory. They are bundled in `frontend/public/images/` and copied into the frontend build by Vite. No image API is required when running the shop.

## Saved files and prompts

`frontend/public/images/hero.png`

> Use case: product-mockup. Create a beautiful premium editorial photograph for an Indian Diwali shopping website. Landscape 1536x1024. A styled collection of lit terracotta panati diyas, ornate ruby red and golden hand painted diyas, brass lotus tealight holders, orange marigold flowers and a small red paper akash kandil lantern, arranged on warm ivory stone with rich burgundy fabric. Photorealistic artisan product photography, warm golden evening glow, textured clay, soft shadows, elegant tasteful composition, no people, no lettering, no watermark. Hero image with products prominent across frame. These are illustrative sample products.

The next three use this common prompt, with the subject below inserted:

> Use case: product-mockup. Square premium catalog product photograph for Diwali shop: [subject]. Warm ivory plaster background, subtle soft shadows, rich natural textures, refined realistic studio photography, entire product visible centered with generous margin. No text, no watermark, no people. Illustrative sample product.

| Saved file | Subject |
| --- | --- |
| `frontend/public/images/panatis.png` | Six small hand painted ruby red and gold terracotta panati diyas arranged neatly, one lit |
| `frontend/public/images/lotus.png` | Two brass lotus flower tealight holders with lit candles |
| `frontend/public/images/kandil.png` | One red and gold traditional Maharashtrian paper akash kandil lantern with long tassels hanging from above |

Google Fonts supplies DM Sans and Playfair Display when internet access permits. CSS includes standard font fallbacks.
