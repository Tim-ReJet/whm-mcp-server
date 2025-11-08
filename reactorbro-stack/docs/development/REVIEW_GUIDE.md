# 🎯 Berg Projects Website - Review Guide

## ✅ Both Servers Running!

---

## 🌐 Access URLs

### 1. **Astro Frontend (Production Build)**
**URL:** http://localhost:3000/

**Pages to Review:**
- Homepage: http://localhost:3000/
- About Us: http://localhost:3000/about
- Services: http://localhost:3000/services
- Projects: http://localhost:3000/projects
- Contact: http://localhost:3000/contact

### 2. **WordPress Backend (DDEV)**
**URL:** http://reactorjet.ddev.site
**Admin:** http://reactorjet.ddev.site/wp-admin
**Credentials:** admin / admin

---

## 📋 Review Checklist

### Homepage (/)
- [ ] Hero section displays correctly
- [ ] Services cards visible and clickable
- [ ] Stats section (15+ years, 500+ projects, etc.)
- [ ] About preview section
- [ ] Call-to-action buttons work
- [ ] Footer with contact info
- [ ] Mobile responsive

### About Page (/about)
- [ ] Company introduction
- [ ] Core values grid (6 values)
- [ ] Company timeline/milestones
- [ ] Team/management section
- [ ] Certifications section
- [ ] CTA section

### Services Page (/services)
- [ ] 5 services displayed:
  1. Construction Management
  2. Project Management
  3. Development Management
  4. Turnkey Design & Construct
  5. Programme Management
- [ ] Each service has features & benefits
- [ ] Process steps section (4 steps)
- [ ] Why Choose Us section

### Projects Page (/projects)
- [ ] Project cards with images/placeholders
- [ ] Filter buttons (All, Commercial, Industrial, etc.)
- [ ] Project details visible
- [ ] Stats section at top
- [ ] Project types showcase
- [ ] Testimonial section

### Contact Page (/contact)
- [ ] Contact form with all fields
- [ ] Contact information sidebar
- [ ] Phone: 083 324 9054
- [ ] Email: marius@bergpartnerships.co.za
- [ ] Service areas listed
- [ ] FAQ accordion section
- [ ] Map placeholder

---

## 🎨 Design Elements to Check

### Colors
- [ ] Primary blue (#2563eb, #1d4ed8) used consistently
- [ ] Accent cyan (#0ea5e9) for highlights
- [ ] Neutral grays for text
- [ ] Good contrast ratios

### Typography
- [ ] Headings are bold and clear
- [ ] Body text readable (16px+)
- [ ] Consistent font sizing
- [ ] Good line height

### Components
- [ ] Cards have shadows and hover effects
- [ ] Buttons are clickable with hover states
- [ ] Navigation is sticky
- [ ] Footer displays properly
- [ ] Icons/emojis visible
- [ ] Badges styled correctly

### Responsive Design
- [ ] Desktop view (1200px+)
- [ ] Tablet view (768px - 1199px)
- [ ] Mobile view (< 768px)
- [ ] Mobile menu works
- [ ] Text is readable on all sizes
- [ ] Images scale properly

---

## 🔍 Testing Points

### Navigation
1. Click logo → Should go to homepage
2. Click "About" → Should go to /about
3. Click "Services" → Should go to /services
4. Click "Projects" → Should go to /projects
5. Click "Contact Us" button → Should go to /contact
6. Test mobile menu (< 768px width)

### Links & Buttons
1. All CTA buttons should be visible
2. Phone number (083 324 9054) should be clickable
3. Email (marius@bergpartnerships.co.za) should open mail client
4. "View More" / "Learn More" links work
5. Footer links navigate correctly

### Forms
1. Contact form has all required fields
2. Form validation works (try submitting empty)
3. Success message appears after submission
4. Checkboxes are clickable

### Performance
1. Pages load quickly (< 2 seconds)
2. No console errors (F12 → Console)
3. Smooth scrolling
4. Hover effects are smooth
5. Animations don't lag

---

## 📱 Mobile Testing

### Resize Browser Window or Use DevTools (F12 → Device Toolbar)

**Test at these widths:**
- 320px (iPhone SE)
- 375px (iPhone 12)
- 768px (iPad)
- 1024px (iPad Pro)
- 1920px (Desktop)

**Check:**
- [ ] Mobile menu opens/closes
- [ ] Text is readable without zooming
- [ ] Buttons are tap-friendly (44px min)
- [ ] Images don't overflow
- [ ] No horizontal scroll
- [ ] Cards stack properly

---

## 🐛 Known Items

### Current Limitations
1. **Images:** Using placeholders (can add real images later)
2. **Contact Form:** Frontend only (needs backend integration)
3. **Project Filtering:** Visual only (can add functionality)
4. **WordPress Content:** Using fallback data where API fails

### Future Enhancements
- Add real project images
- Integrate contact form with email service
- Add image galleries for projects
- Connect more WordPress content
- Add testimonials section
- Add blog/news section

---

## 💡 Tips for Review

### Browser DevTools (F12)
- **Console:** Check for JavaScript errors
- **Network:** Verify all assets load
- **Lighthouse:** Run performance audit
- **Responsive:** Test different screen sizes

### What to Look For
- ✅ Professional appearance
- ✅ Easy navigation
- ✅ Clear call-to-actions
- ✅ Mobile-friendly
- ✅ Fast loading
- ✅ Good content hierarchy
- ✅ Consistent branding

### Questions to Ask
1. Does it look professional for a construction company?
2. Is the information clear and easy to find?
3. Would potential clients trust this company?
4. Is it easy to contact the company?
5. Do the services stand out?
6. Is the portfolio impressive?

---

## 🎬 Quick Demo Flow

**1. Landing (Homepage)**
   - See hero → "Building Excellence Since 2015"
   - Scroll to stats → 500+ projects, 15+ years
   - View services preview
   - Read about section

**2. Learn More (About Page)**
   - Company history and philosophy
   - Core values
   - Timeline of achievements
   - Team profiles

**3. Explore Services**
   - See all 5 service offerings
   - Read features and benefits
   - Understand the process

**4. View Work (Projects)**
   - Browse portfolio
   - Filter by category
   - See project details

**5. Get in Touch (Contact)**
   - Fill out contact form
   - See contact information
   - Read FAQs

---

## 📊 Success Criteria

### Design
- [x] Modern, professional appearance
- [x] Consistent color scheme
- [x] Good typography
- [x] Proper spacing and layout

### Content
- [x] Clear value proposition
- [x] All services described
- [x] Contact information visible
- [x] Company credentials shown

### Functionality
- [x] All pages accessible
- [x] Navigation works
- [x] Mobile responsive
- [x] Fast loading

### SEO
- [x] Meta descriptions
- [x] Semantic HTML
- [x] Clean URLs
- [x] Sitemap generated

---

## 🚀 After Review

### If Approved
1. Note any changes needed
2. Make adjustments
3. Rebuild: `cd apps/astro && pnpm run build`
4. Deploy to production

### To Stop Servers
```bash
# Stop Astro server
kill $(cat /tmp/astro-server.pid)

# Stop WordPress
ddev stop
```

---

## 📞 Support

If you find any issues or have questions:
1. Check console for errors (F12)
2. Review this guide
3. Check main documentation (BERG_PROJECTS_README.md)

---

**Happy Reviewing! 🎉**

The site is ready for your feedback!
