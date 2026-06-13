# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: basic.spec.ts >> App smoke tests >> login page loads and shows auth fields
- Location: tests\basic.spec.ts:9:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Tearing down "context" exceeded the test timeout of 30000ms.
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]: ✦ Xush kelibsiz
    - heading "To'yxona.uz" [level=1] [ref=e6]
    - paragraph [ref=e7]: Tizimga kiring
  - generic [ref=e8]:
    - generic [ref=e9]:
      - generic [ref=e10]: Email
      - textbox "Email" [ref=e11]:
        - /placeholder: email@example.com
    - generic [ref=e12]:
      - generic [ref=e13]: Parol
      - textbox "Parol" [ref=e14]:
        - /placeholder: Parolni kiriting
    - link "Parolni unutdingizmi?" [ref=e16] [cursor=pointer]:
      - /url: /forgot-password
    - button "Kirish" [ref=e17] [cursor=pointer]
  - generic [ref=e18]:
    - text: Akkountingiz yo'qmi?
    - link "Ro'yxatdan o'ting" [ref=e19] [cursor=pointer]:
      - /url: /register
  - generic [ref=e20]:
    - paragraph [ref=e21]: Test akkauntlar
    - generic [ref=e22]:
      - button "Admin superadmin@wedding.uz" [ref=e23] [cursor=pointer]:
        - generic [ref=e24]: Admin
        - generic [ref=e25]: superadmin@wedding.uz
      - button "Hall Owner hallowner_test@wedding.uz" [ref=e26] [cursor=pointer]:
        - generic [ref=e27]: Hall Owner
        - generic [ref=e28]: hallowner_test@wedding.uz
      - button "Customer customer_test@wedding.uz" [ref=e29] [cursor=pointer]:
        - generic [ref=e30]: Customer
        - generic [ref=e31]: customer_test@wedding.uz
```