# CI/CD + Deployment Pipeline Blueprint

เอกสารนี้เป็นบลูพรินต์สำหรับตั้งค่า CI/CD ของโปรเจกต์ ATR-AI-AUTO ให้ครอบคลุมตั้งแต่การตรวจคุณภาพโค้ด, การทดสอบ, การ build, ไปจนถึงการ deploy ทั้งเว็บและ Android artifact

---

## 1) เป้าหมายของ Pipeline

- ลดความเสี่ยงจากการ merge โค้ดที่ทำให้ระบบพัง
- ทำให้คุณภาพโค้ดสม่ำเสมอด้วย lint + test + build checks
- รองรับการปล่อยเวอร์ชันแบบแยกสภาพแวดล้อม (`staging`, `production`)
- จัดเก็บ artifacts ที่ตรวจสอบย้อนหลังได้ (web build, Android APK/AAB)

---

## 2) Branching Strategy (แนะนำ)

- `main` = production-ready
- `develop` = integration branch สำหรับฟีเจอร์ใหม่
- `feature/*` = งานรายฟีเจอร์
- `hotfix/*` = แก้ปัญหาเร่งด่วน production

นโยบาย merge:
- บังคับ Pull Request + 1 reviewer ขึ้นไป
- ต้องผ่าน required checks ก่อน merge
- แนะนำใช้ Squash merge เพื่อให้ commit history อ่านง่าย

---

## 3) Environment Design

### Environments

- **CI**: ตรวจโค้ดทุก push/PR
- **Staging**: deploy อัตโนมัติจาก `develop`
- **Production**: deploy จาก tag (เช่น `v1.4.0`) หรือ manual approval

### ตัวแปรสำคัญ (Secrets / Variables)

- `NODE_VERSION` (เช่น 20)
- `VITE_API_BASE_URL`
- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `PLAY_STORE_SERVICE_ACCOUNT_JSON` (ถ้าจะส่งขึ้น Play Store อัตโนมัติ)

---

## 4) Pipeline Stages

### Stage A: Validate

ทริกเกอร์: ทุก `push` และ `pull_request`

งานที่ต้องรัน:
1. Checkout source
2. Setup Node.js + dependency cache
3. `npm ci`
4. `npm run lint`
5. `npm test -- --runInBand` (หรือคำสั่งทดสอบที่ทีมกำหนด)
6. `npm run build`

ผลลัพธ์:
- ถ้าขั้นตอนไหนล้มเหลว ให้ pipeline fail ทันที
- อัปโหลด build log / test report เพื่อ debug

### Stage B: Package Web

ทริกเกอร์: merge เข้า `develop` หรือ release tag

งานที่ต้องรัน:
1. `npm ci`
2. `npm run build`
3. อัปโหลดโฟลเดอร์ `dist/` เป็น artifact

### Stage C: Package Android

ทริกเกอร์: release candidate หรือ release tag

งานที่ต้องรัน:
1. Setup JDK (17)
2. `npm ci`
3. `npm run build`
4. `npx cap sync android`
5. Decode keystore จาก secret
6. Build signed artifact:
   - `./gradlew assembleRelease` (APK)
   - หรือ `./gradlew bundleRelease` (AAB)
7. Upload APK/AAB เป็น artifact

### Stage D: Deploy

- **Staging Web**: deploy artifact จาก `develop` ไป staging host
- **Production Web**: deploy เมื่อสร้าง release tag
- **Android**:
  - แบบ manual: ดาวน์โหลด artifact แล้วอัปโหลดเอง
  - แบบอัตโนมัติ: ส่ง AAB ไป Google Play internal track

---

## 5) ตัวอย่าง GitHub Actions Blueprint

> ตัวอย่างนี้เป็นโครง workflow หลัก สามารถแยกเป็นหลายไฟล์ได้ เช่น `ci.yml`, `deploy-staging.yml`, `release.yml`

```yaml
name: ci-cd-blueprint

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]
    tags:
      - 'v*'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run build

  package-web:
    needs: validate
    if: github.ref == 'refs/heads/develop' || startsWith(github.ref, 'refs/tags/v')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: web-dist
          path: dist

  package-android:
    needs: validate
    if: startsWith(github.ref, 'refs/tags/v')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '17'
      - run: npm ci
      - run: npm run build
      - run: npx cap sync android
      - run: cd android && ./gradlew bundleRelease
      - uses: actions/upload-artifact@v4
        with:
          name: android-aab
          path: android/app/build/outputs/bundle/release/*.aab
```

---

## 6) Deployment Strategy Recommendations

### Web Deployment

แนะนำอย่างใดอย่างหนึ่ง:
- Vercel / Netlify (ง่ายและเร็ว)
- Cloud Run + Cloud CDN (ยืดหยุ่น)
- S3 + CloudFront (ประหยัดสำหรับ static hosting)

แนวทาง:
- Staging ผูกกับ `develop`
- Production ผูกกับ tag release
- เปิดใช้งาน rollback โดยเก็บ previous artifact ไว้เสมอ

### Android Deployment

ลำดับ rollout ที่แนะนำ:
1. Internal testing
2. Closed testing
3. Production rollout แบบเป็นเปอร์เซ็นต์

---

## 7) Quality Gates ที่ควรมี

- Lint ต้องผ่าน 100%
- Build ต้องผ่านทุก target ที่ทีมรองรับ
- มี minimum test threshold (ถ้ามี test coverage tooling)
- Dependency audit (เช่น `npm audit --production`) ใน nightly job
- Conventional commits / PR title check (optional)

---

## 8) Security + Compliance Checklist

- เก็บ secrets ใน GitHub Secrets เท่านั้น
- ไม่ commit keystore หรือ `.env.production`
- เปิด branch protection บน `main`
- เปิด required status checks
- เซ็น artifact ทุกครั้งก่อนปล่อย
- เก็บ SBOM / dependency snapshot สำหรับงาน audit (ถ้าทีมต้องการ)

---

## 9) Monitoring หลัง Deploy

- Web: uptime check + JS error tracking
- API latency / error-rate alert
- Android crash reporting (Firebase Crashlytics)
- กำหนด incident channel (เช่น Slack/LINE)

---

## 10) Rollback Playbook (ย่อ)

1. หยุด rollout
2. rollback ไป artifact เวอร์ชันล่าสุดที่เสถียร
3. ตรวจ logs + root cause
4. ออก hotfix ผ่าน `hotfix/*`
5. postmortem ภายใน 24-48 ชั่วโมง

---

## 11) Roadmap การใช้งานจริง (30 วัน)

- **Week 1**: ตั้ง CI validate job + branch protection
- **Week 2**: เพิ่ม web staging deploy
- **Week 3**: เพิ่ม Android signed build pipeline
- **Week 4**: เพิ่ม production release + monitoring + rollback drill

