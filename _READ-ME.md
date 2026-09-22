# The four files that were missing — customer discount display

⚠️ **This is why customers still saw full price.** These files were changed one message *before* the
referral name fix, so they fell outside the range you asked me to zip. The previous zip shipped
`productPricing.ts` (the helper) but none of the files that actually *use* it on the customer side —
so nothing on the shop grid was calling it.

Extract over your repo root:

```bash
unzip -o declan-discount-display.zip
npm install && npm run build
```

---

## What each file does

| File | What it fixes |
|---|---|
| `src/app/lib/productPricing.ts` | The helper. Probably identical to what you already have — harmless to re-paste. |
| `src/components/ui/ProductCard.tsx` | **The shop grid.** Shows `₦50` with `₦70` struck through and a `29% OFF` badge. Its Add-to-Cart also stores the **discounted** price in the guest cart — without that, the card says ₦50 and checkout charges ₦70. |
| `src/components/ui/ProductDetails.tsx` | **The product page.** Same treatment plus "You save ₦20". Same cart fix. |
| `src/components/pages/app/DashboardHome.tsx` | The **"Buy Again"** rows on the home screen. |
| `src/components/pages/admin/products/ProductList.tsx` | The **admin** list — so you can see at a glance which products are discounted. |

---

## Why it works — `product.price` is not the shelf price

```json
{ "name": "speedy buiscuit",
  "price": "70",          ← the price BEFORE the discount. Not what customers pay.
  "discount": {
    "discountValue": 20,
    "discountType": "fixed_discount",
    "isExpired": false,
    "originalPrice": "70",
    "discountPrice": 50   ← what the customer actually pays
  } }
```

Every card used to read `product.price` and ignore `product.discount` completely. Across the 8 products
currently live, **5 carry a discount and none of them were showing**:

| Product | list | customers should see |
|---|---|---|
| speedy buiscuit | ₦70 | **₦50** |
| Green Pea | ₦20,000 | **₦18,000** |
| mammador 5l oil | ₦9,000 | **₦8,000** |
| indomie 70g | ₦300 | **₦250** |
| bag of premium rice | ₦100,000 | **₦90,000** |

`smoked catfish`, `fresh beef` and `palm oil 2.5l` have no discount and correctly stay unchanged.

---

## After extracting, check

1. **Shop** (`/app/shop`) → tab **Products** → "speedy buiscuit" should read **₦50** with ₦70 struck
   through and a **29% OFF** badge.
2. **Tap into that product** → same price, plus **"You save ₦20"**.
3. **Home screen → Buy Again** → discounted prices there too.
4. **Signed out:** add it to the cart → **checkout must total ₦50**, not ₦70.

> **Point 4 matters.** For a signed-out customer the cart stores the price locally, and checkout totals
> straight off it. This zip writes the *discounted* price there. For a **signed-in** customer the server
> builds the cart line instead — and I could not verify which price the API returns, because no saved
> cart or order response in the collection shows a discounted product. If a signed-in checkout comes to
> **₦70 instead of ₦50**, that is a backend issue and it is question 1 of section 7 in the backend
> message. Tell me and I will chase it.

---

## Still outstanding from before

```bash
git rm src/components/pages/rider/Earnings.tsx          # rider earnings — zip cannot delete
git rm src/components/pages/admin/users/mockUsers.ts    # mock data, breaks the build
git rm src/components/pages/admin/referral/mockReferralData.ts
```
