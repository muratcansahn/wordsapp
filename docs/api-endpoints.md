    # Backend Endpointleri

## 1. Kelime Listeleri ve Öğrenme Endpointleri

```
GET /api/word-lists
```
- Tüm kelime listelerini getirir
- Yanıt: Kelime listelerinin ID, başlık, açıklama, ikon, kelime sayısı ve öğrenilen kelime sayısı bilgilerini içerir

```
GET /api/word-lists/:listId
```
- Belirli bir kelime listesinin detaylarını getirir
- Yanıt: Listenin detayları ve içerdiği kelimeler

```
GET /api/word-lists/:listId/words
```
- Belirli bir listedeki kelimeleri getirir
- Yanıt: Kelime, çeviri, örnek cümle ve açıklama bilgilerini içerir

```
POST /api/word-lists/:listId/progress
```
- Kullanıcının bir kelime listesindeki ilerlemesini günceller
- İstek gövdesi: `{ userId, learnedWords: ["wordId1", "wordId2", ...] }`
- Yanıt: Güncellenmiş ilerleme durumu

## 2. Flashcards Endpointleri

```
GET /api/flashcards/:listId
```
- Belirli bir listeye ait flashcard'ları getirir
- Yanıt: Kelime, çeviri, örnek cümle bilgilerini içerir

```
POST /api/flashcards/progress
```
- Kullanıcının flashcard ilerlemesini kaydeder
- İstek gövdesi: `{ userId, listId, knownWords: ["wordId1", "wordId2", ...], unknownWords: ["wordId3", "wordId4", ...] }`
- Yanıt: Güncellenmiş ilerleme durumu

```
POST /api/flashcards/favorites
```
- Kullanıcının favori kelimelerini kaydeder
- İstek gövdesi: `{ userId, wordId, isFavorite: true/false }`
- Yanıt: Güncellenmiş favori listesi

## 3. Alıştırmalar ve Testler Endpointleri

```
GET /api/exercises
```
- Mevcut tüm alıştırmaları getirir
- Yanıt: Alıştırma ID, başlık, açıklama, zorluk seviyesi ve XP ödülü bilgilerini içerir

```
GET /api/exercises/:exerciseId
```
- Belirli bir alıştırmanın detaylarını getirir
- Yanıt: Alıştırma detayları ve soruları

```
POST /api/exercises/:exerciseId/submit
```
- Kullanıcının alıştırma cevaplarını gönderir ve değerlendirir
- İstek gövdesi: `{ userId, answers: [{ questionId, answer }] }`
- Yanıt: Doğru/yanlış cevaplar, kazanılan XP ve ilerleme bilgisi

```
GET /api/writing-exercises
```
- Yazma alıştırmalarını getirir
- Yanıt: Kelime, ipucu, örnek cümle bilgilerini içerir

```
POST /api/writing-exercises/submit
```
- Yazma alıştırması cevabını gönderir
- İstek gövdesi: `{ userId, exerciseId, answer }`
- Yanıt: Değerlendirme sonucu ve kazanılan XP

## 4. Çoklu Oyuncu Modu Endpointleri

```
GET /api/leaderboard
```
- Liderlik tablosunu getirir
- Yanıt: Oyuncuların sıralama, isim, seviye, XP ve avatar bilgilerini içerir

```
POST /api/games/create
```
- Yeni bir oyun oluşturur
- İstek gövdesi: `{ player1Id }`
- Yanıt: Oluşturulan oyun ID'si ve durumu

```
POST /api/games/:gameId/join
```
- Mevcut bir oyuna katılır
- İstek gövdesi: `{ player2Id }`
- Yanıt: Oyun durumu ve detayları

```
POST /api/games/invites
```
- Oyun daveti gönderir
- İstek gövdesi: `{ senderId, receiverId, gameId }`
- Yanıt: Davet durumu

```
PUT /api/games/invites/:inviteId
```
- Oyun davetini yanıtlar (kabul/red)
- İstek gövdesi: `{ status: "accepted" | "rejected" }`
- Yanıt: Güncellenmiş davet durumu

```
GET /api/games/:gameId
```
- Oyun durumunu getirir
- Yanıt: Oyun detayları, oyuncular ve skor

```
POST /api/games/:gameId/answer
```
- Oyun içinde cevap gönderir
- İstek gövdesi: `{ playerId, answer }`
- Yanıt: Cevap değerlendirmesi ve güncellenmiş skor

## 5. Seviye Testi Endpointleri

```
GET /api/level-test
```
- Seviye testi sorularını getirir
- Yanıt: Soru listesi, seçenekler ve doğru cevaplar

```
POST /api/level-test/submit
```
- Seviye testi cevaplarını gönderir ve değerlendirir
- İstek gövdesi: `{ userId, answers: [{ questionId, answer }] }`
- Yanıt: Test sonucu, belirlenen seviye ve önerilen kelime listeleri

## 6. Kullanıcı İlerleme ve İstatistik Endpointleri

```
GET /api/users/:userId/progress
```
- Kullanıcının genel ilerlemesini getirir
- Yanıt: Öğrenilen kelime sayısı, tamamlanan alıştırmalar, seviye ve XP bilgisi

```
GET /api/users/:userId/stats
```
- Kullanıcının istatistiklerini getirir
- Yanıt: Günlük aktivite, doğru/yanlış cevap oranı, en çok zorlanılan kelimeler

```
GET /api/users/:userId/recommendations
```
- Kullanıcıya özel kelime listesi ve alıştırma önerileri getirir
- Yanıt: Önerilen kelime listeleri ve alıştırmalar

## 7. Genel Endpointler

```
GET /api/search
```
- Kelime, liste veya alıştırma araması yapar
- Sorgu parametreleri: `query`, `type` (word, list, exercise)
- Yanıt: Arama sonuçları

```
GET /api/daily-challenge
```
- Günlük meydan okuma getirir
- Yanıt: Günlük kelime, alıştırma veya test

Bu endpointler, uygulamanızın mevcut özelliklerini destekleyecek şekilde tasarlanmıştır. Uygulamanın ihtiyaçlarına göre daha fazla endpoint eklenebilir veya mevcut endpointler özelleştirilebilir.
