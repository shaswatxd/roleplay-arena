# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: voting-results.spec.ts >> Voting + Results Tests >> Voting shows trophy after click
- Location: tests\voting-results.spec.ts:7:3

# Error details

```
Test timeout of 120000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - generic [ref=e6]: 🏆
    - heading "Debate Complete" [level=2] [ref=e7]
    - generic [ref=e8]: “Test voting feature” — 2 characters, 2 rounds
  - generic [ref=e9]:
    - generic [ref=e10]:
      - generic [ref=e11]: 📝
      - generic [ref=e12]: AI Summary
    - generic [ref=e13]: "Main in debate ke baare mein ek samajhdaar vichar dete hoon: Elon Musk ne argue kiya ki \"test voting feature\" ki zaroorat nahin hai kyunki yeh logon ko baser instincts ka karan banayega aur vichardhara ek asantulit ho jaayega. Wo kaha ki yeh feature koi naya change nahin laayega. Mahatma Gandhi ne uttar diya ki sachchai kisi bhi cheez ko jaanti hai, par sachchai kaam karti hai ya nahi, yeh question hai. Unhone kaha ki test voting feature hame sachchai ki or le jata hai aur humein apne vichaaron par utsaha karna padta hai. Main yeh samjhaunga ki Mahatma Gandhi ne yeh sawal uthaya ki kya hame zaroorat hai ki har cheez kaam karne wali hogi ya phir sachchai par utsah karna. Unke aakhir ke vicharon ne mujhe yeh samajhaya ki test voting feature ek naya sawal uthta hai, jismein humein sachchai ki or chalna hai aur apne vichaaron par utsah karna hai. Unhone kuchh zaroor ki ummeed ki hai."
  - generic [ref=e14]:
    - generic [ref=e15]:
      - generic [ref=e16]: 🎭
      - generic [ref=e17]: Character Stats
    - generic [ref=e18]:
      - generic [ref=e19]:
        - img "Elon Musk" [ref=e21]
        - generic [ref=e22]:
          - generic [ref=e23]: Elon Musk
          - generic [ref=e24]: Tech billionaire, Mars obsessive, free speech absolutist
        - generic [ref=e25]:
          - text: 2 turns
          - text: 82 words
      - generic [ref=e26]:
        - img "Mahatma Gandhi" [ref=e28]
        - generic [ref=e29]:
          - generic [ref=e30]: Mahatma Gandhi
          - generic [ref=e31]: Non-violence philosopher, freedom fighter, spiritual leader
        - generic [ref=e32]:
          - text: 2 turns
          - text: 119 words
  - generic [ref=e33]:
    - generic [ref=e34]:
      - generic [ref=e35]: 🗳️
      - generic [ref=e36]: Who Won?
    - generic [ref=e37]:
      - generic [ref=e38]: Cast your vote — who argued best?
      - button "Elon Musk Elon Musk Tech billionaire, Mars obsessive, free speech absolutist ▸" [ref=e39] [cursor=pointer]:
        - img "Elon Musk" [ref=e41]
        - generic [ref=e42]:
          - generic [ref=e43]: Elon Musk
          - generic [ref=e44]: Tech billionaire, Mars obsessive, free speech absolutist
        - generic [ref=e45]: ▸
      - button "Mahatma Gandhi Mahatma Gandhi Non-violence philosopher, freedom fighter, spiritual leader ▸" [ref=e46] [cursor=pointer]:
        - img "Mahatma Gandhi" [ref=e48]
        - generic [ref=e49]:
          - generic [ref=e50]: Mahatma Gandhi
          - generic [ref=e51]: Non-violence philosopher, freedom fighter, spiritual leader
        - generic [ref=e52]: ▸
  - generic [ref=e53]:
    - generic [ref=e54]:
      - button "Share" [ref=e55] [cursor=pointer]:
        - img [ref=e56]
        - text: Share
      - button "Copy" [ref=e62] [cursor=pointer]:
        - img [ref=e63]
        - text: Copy
      - button "Export" [ref=e66] [cursor=pointer]:
        - img [ref=e67]
        - text: Export
    - button "New Debate" [ref=e70] [cursor=pointer]:
      - img [ref=e71]
      - text: New Debate
    - button "Rematch (same topic)" [ref=e73] [cursor=pointer]:
      - img [ref=e74]
      - text: Rematch (same topic)
```