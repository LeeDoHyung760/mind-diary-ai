import os
import random

import requests


YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"


DEFAULT_TAGS = ["calm", "healing", "sad"]


TAG_ALIAS_MAP = {
    # English labels
    "calm": ["calm", "healing", "soft"],
    "peaceful": ["calm", "healing", "soft"],
    "relaxed": ["calm", "healing", "soft"],

    "sad": ["sad", "healing", "calm"],
    "sadness": ["sad", "healing", "calm"],
    "depressed": ["sad", "healing", "calm"],
    "down": ["sad", "healing", "calm"],

    "happy": ["happy", "bright", "energetic"],
    "joy": ["happy", "bright", "energetic"],
    "excited": ["happy", "bright", "energetic"],

    "angry": ["angry", "calm", "healing"],
    "anger": ["angry", "calm", "healing"],
    "mad": ["angry", "calm", "healing"],

    "anxious": ["anxious", "calm", "healing"],
    "anxiety": ["anxious", "calm", "healing"],
    "stress": ["anxious", "calm", "healing"],
    "stressed": ["anxious", "calm", "healing"],

    "tired": ["tired", "healing", "lofi"],
    "fatigue": ["tired", "healing", "lofi"],

    # Korean labels
    "슬픔": ["sad", "healing", "calm"],
    "우울": ["sad", "healing", "calm"],
    "기쁨": ["happy", "bright", "energetic"],
    "행복": ["happy", "bright", "energetic"],
    "분노": ["angry", "calm", "healing"],
    "화남": ["angry", "calm", "healing"],
    "불안": ["anxious", "calm", "healing"],
    "스트레스": ["anxious", "calm", "healing"],
    "피곤": ["tired", "healing", "lofi"],
    "중립": ["calm", "healing", "soft"],
}


def normalize_tags(raw_tags):
    if not raw_tags:
        return DEFAULT_TAGS

    normalized = []

    for tag in raw_tags:
        if not tag:
            continue

        value = str(tag).strip().lower()

        if not value:
            continue

        mapped = TAG_ALIAS_MAP.get(value)

        if mapped:
            for item in mapped:
                if item not in normalized:
                    normalized.append(item)
        else:
            if value not in normalized:
                normalized.append(value)

    if not normalized:
        return DEFAULT_TAGS

    return normalized[:3]


def extract_tags_from_emotion_result(emotion_result):
    """
    emotion_result가 어떤 형태로 오든 최대한 받아주는 함수.

    지원 예시:
    {"label": "sad"}
    {"label": "sad", "tags": ["sad", "healing", "calm"]}
    {"emotion": "슬픔"}
    {"tags": ["calm", "healing", "sad"]}
    """

    if not isinstance(emotion_result, dict):
        return DEFAULT_TAGS

    direct_tags = emotion_result.get("tags")

    if isinstance(direct_tags, list) and direct_tags:
        return normalize_tags(direct_tags)

    label = (
        emotion_result.get("label")
        or emotion_result.get("emotion")
        or emotion_result.get("class")
        or emotion_result.get("category")
    )

    if label:
        return normalize_tags([label])

    return DEFAULT_TAGS


def recommend_music_by_tags(tags, limit=4):
    api_key = os.getenv("YOUTUBE_API_KEY")

    if not api_key:
        raise RuntimeError("YOUTUBE_API_KEY is missing")

    tags = normalize_tags(tags)
    tag_text = " ".join(tags)

    try:
        limit = int(limit)
    except ValueError:
        limit = 4

    limit = max(3, min(limit, 4))

    blocked_words = [
        "playlist",
        "mix",
        "compilation",
        "1 hour",
        "2 hours",
        "hour",
        "cover",
        "covered by",
        "piano cover",
        "acoustic cover",
        "instrumental",
        "karaoke",
        "lyrics",
        "lyric video",
        "audio only",
        "full album",
        "모음",
        "플레이리스트",
        "노래모음",
        "연속재생",
        "커버",
        "피아노",
        "가사",
        "광고없는",
        "광고 없는",
        "노동요",
        "歌ってみた",
        "カバー",
        "作業用",
    ]

    official_words = [
        "official",
        "official mv",
        "official music video",
        "official video",
        "mv",
        "m/v",
        "music video",
        "오피셜",
        "공식",
        "[mv]",
        "뮤직비디오",
        "ミュージックビデオ",
    ]

    search_profiles = [
        {
            "market": "KR",
            "regionCode": "KR",
            "relevanceLanguage": "ko",
            "query": f"{tag_text} korean official mv kpop ballad music video",
        },
        {
            "market": "JP",
            "regionCode": "JP",
            "relevanceLanguage": "ja",
            "query": f"{tag_text} jpop official music video",
        },
        {
            "market": "US",
            "regionCode": "US",
            "relevanceLanguage": "en",
            "query": f"{tag_text} pop official music video",
        },
    ]

    tracks_by_market = {
        "KR": [],
        "JP": [],
        "US": [],
    }

    used_queries = []
    seen_candidate_ids = set()

    for profile in search_profiles:
        params = {
            "part": "snippet",
            "q": profile["query"],
            "type": "video",
            "maxResults": 15,
            "order": "relevance",
            "safeSearch": "moderate",
            "regionCode": profile["regionCode"],
            "relevanceLanguage": profile["relevanceLanguage"],
            "videoCategoryId": "10",
            "key": api_key,
        }

        used_queries.append({
            "market": profile["market"],
            "query": profile["query"],
        })

        response = requests.get(YOUTUBE_SEARCH_URL, params=params, timeout=10)
        response.raise_for_status()

        data = response.json()
        market_candidates = []

        for item in data.get("items", []):
            video_id = item.get("id", {}).get("videoId")
            snippet = item.get("snippet", {})

            if not video_id:
                continue

            if video_id in seen_candidate_ids:
                continue

            title = snippet.get("title", "")
            description = snippet.get("description", "")
            channel = snippet.get("channelTitle", "")

            text_for_filter = f"{title} {description} {channel}".lower()

            if any(word.lower() in text_for_filter for word in blocked_words):
                continue

            official_score = 0

            if any(word.lower() in text_for_filter for word in official_words):
                official_score += 2

            if "official" in channel.lower():
                official_score += 1

            if "vevo" in channel.lower():
                official_score += 1

            if " - topic" in channel.lower():
                official_score -= 1

            thumbnails = snippet.get("thumbnails", {})
            thumbnail_url = None

            if "high" in thumbnails:
                thumbnail_url = thumbnails["high"].get("url")
            elif "medium" in thumbnails:
                thumbnail_url = thumbnails["medium"].get("url")
            elif "default" in thumbnails:
                thumbnail_url = thumbnails["default"].get("url")

            market_candidates.append({
                "market": profile["market"],
                "videoId": video_id,
                "title": title,
                "artist": channel,
                "channel": channel,
                "description": description,
                "thumbnail": thumbnail_url,
                "youtubeUrl": f"https://www.youtube.com/watch?v={video_id}",
                "officialScore": official_score,
                "searchQuery": profile["query"],
            })

            seen_candidate_ids.add(video_id)

        market_candidates.sort(
            key=lambda track: track["officialScore"],
            reverse=True
        )

        tracks_by_market[profile["market"]] = market_candidates[:6]

    patterns_3 = [
        ["KR", "JP", "US"],
        ["KR", "KR", "US"],
        ["KR", "KR", "JP"],
        ["JP", "JP", "KR"],
        ["JP", "JP", "US"],
        ["US", "US", "KR"],
        ["US", "US", "JP"],
    ]

    patterns_4 = [
        ["KR", "KR", "US", "JP"],
        ["JP", "JP", "US", "KR"],
        ["US", "US", "KR", "JP"],
        ["KR", "KR", "JP", "JP"],
        ["JP", "JP", "US", "US"],
        ["KR", "KR", "US", "US"],
        ["KR", "JP", "US", "US"],
        ["KR", "JP", "JP", "US"],
    ]

    patterns = patterns_4 if limit == 4 else patterns_3
    available_patterns = []

    for pattern in patterns:
        market_counts = {}
        possible = True

        for market in pattern:
            market_counts[market] = market_counts.get(market, 0) + 1

            if len(tracks_by_market.get(market, [])) < market_counts[market]:
                possible = False
                break

        if possible:
            available_patterns.append(pattern)

    selected_tracks = []
    selected_pattern = None

    if not available_patterns:
        all_candidates = []

        for candidates in tracks_by_market.values():
            all_candidates.extend(candidates)

        all_candidates.sort(
            key=lambda track: track["officialScore"],
            reverse=True
        )

        selected_tracks = all_candidates[:limit]
        selected_pattern = ["FALLBACK"]

    else:
        selected_pattern = random.choice(available_patterns)
        selected_ids = set()

        for market in selected_pattern:
            candidates = [
                track for track in tracks_by_market.get(market, [])
                if track["videoId"] not in selected_ids
            ]

            if not candidates:
                continue

            top_candidates = candidates[:3]
            selected_track = random.choice(top_candidates)

            selected_tracks.append(selected_track)
            selected_ids.add(selected_track["videoId"])

    candidate_counts = {
        market: len(candidates)
        for market, candidates in tracks_by_market.items()
    }

    return {
        "tags": tags,
        "queries": used_queries,
        "selectedPattern": selected_pattern,
        "candidateCounts": candidate_counts,
        "tracks": selected_tracks,
    }