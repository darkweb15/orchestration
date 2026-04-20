# Social Links & Email Extraction - How It Actually Works

## Important Discovery! 🔍

**Google Maps DOES NOT show social media links on business pages!**

I tested this and confirmed:
- Google Maps only shows: Name, Address, Phone, Website, Hours, Reviews
- NO Facebook, Instagram, Twitter, or LinkedIn links on Google Maps pages
- This is by Google's design

## Correct Flow (How It Actually Works)

```
Step 1: Google Maps Scraper
├─ Extracts: Name, Address, Phone
├─ Extracts: Website URL ✅ (MOST IMPORTANT!)
├─ Extracts: Rating, Reviews, Hours
├─ Extracts: Place ID
└─ Extracts: Any emails visible on Maps page

Step 2: Email Extractor (Gets Social Links!)
├─ Takes Website URL from Step 1
├─ Visits the business website
├─ Extracts social links from website:
│   ├─ Facebook link ✅
│   ├─ Instagram link ✅
│   ├─ Twitter link ✅
│   └─ LinkedIn link ✅
├─ Extracts emails from website
└─ Returns everything

Step 3: Facebook Email Extractor
├─ Takes Facebook link from Step 2
├─ Visits Facebook page
├─ Extracts email from About section
└─ Returns Facebook email ✅

Step 4: Instagram Email Extractor
├─ Takes Instagram link from Step 2
├─ Visits Instagram profile
├─ Extracts email from bio
└─ Returns Instagram email ✅
```

## Why This Is Better

### Old (Wrong) Approach:
❌ Try to get social links from Google Maps
❌ Waste time scrolling/waiting
❌ Get nothing because links don't exist there

### New (Correct) Approach:
✅ Get website URL from Google Maps (fast!)
✅ Visit website and extract social links (accurate!)
✅ Visit Facebook/Instagram for emails (complete!)

## Test Results

### Test 1: Website Extraction
```
Website: https://www.kahlonyc.com
✅ Emails: ['contactus@kahlonyc.com']
✅ Facebook: https://www.facebook.com/kahlonyc
✅ Instagram: https://www.instagram.com/kahlonyc
```

### Test 2: Facebook Email
```
Facebook: https://www.facebook.com/kahlonyc
✅ Email: contactus@kahlonyc.com
```

## What Gets Extracted (Complete List)

### From Google Maps:
- ✅ Business name
- ✅ Full address
- ✅ Phone number
- ✅ **Website URL** (KEY - used to find social links!)
- ✅ Rating & reviews
- ✅ Opening hours
- ✅ Category
- ✅ Place ID
- ✅ Any emails on Maps page
- ❌ Social links (NOT available on Google Maps)

### From Business Website:
- ✅ Homepage emails
- ✅ Contact page emails
- ✅ **Facebook link** (from website footer/header)
- ✅ **Instagram link** (from website footer/header)
- ✅ **Twitter link** (from website footer/header)
- ✅ **LinkedIn link** (from website footer/header)

### From Facebook Page:
- ✅ Email from About section
- ✅ Email from Contact Info

### From Instagram Profile:
- ✅ Email from bio

## Why Facebook Emails Might Not Work

If Facebook emails are not coming, check:

1. **Website URL missing?**
   - No website = No social links found
   - Check if Google Maps has website

2. **Website doesn't have Facebook link?**
   - Some businesses don't link their Facebook
   - Check website footer/header manually

3. **Facebook page has no email?**
   - Many businesses don't add email to Facebook
   - This is normal, not a bug

4. **Facebook blocking?**
   - Facebook might block automated access
   - We use Playwright to avoid this
   - But still might fail sometimes

## Success Rate (Expected)

- **Website URL:** 90% (most businesses have websites)
- **Social links from website:** 60-70% (many have FB/IG links)
- **Facebook email:** 30-40% (many don't add email to FB)
- **Instagram email:** 20-30% (fewer add email to IG)
- **Website email:** 70-80% (most have contact pages)

## Debugging

To check if it's working:

```bash
# Check logs for:
"Extracted: Name | web=https://... | phone=..."  # Google Maps ✅
"Found Facebook emails from ..."                  # Facebook extraction ✅
```

```sql
-- Check database:
SELECT 
    name,
    website,           -- Should be populated
    facebook_link,     -- From website, not Maps
    instagram_link,    -- From website, not Maps
    facebook_email,    -- From Facebook page
    final_email,       -- Best email found
    email_source       -- Where it came from
FROM business_data
LIMIT 10;
```

## Summary

**The Real Flow:**
1. Google Maps → Get Website URL
2. Website → Get Social Links
3. Facebook/Instagram → Get Emails

**NOT:**
1. ~~Google Maps → Get Social Links~~ ❌ (They don't exist there!)

---
**Status:** ✅ Working Correctly
**Date:** 2026-04-17
**Key Learning:** Google Maps doesn't show social links - we get them from business websites instead!
