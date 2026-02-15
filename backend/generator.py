from openai import OpenAI, AuthenticationError, RateLimitError, APIError, APITimeoutError
import os
import re
import json
import logging

logger = logging.getLogger(__name__)

class Generator:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )

    def get_next_question(self, contact_name: str, history: list, model: str = "deepseek/deepseek-v3.2") -> dict:
        """
        Called ONLY after the 5 basic questions are done (handled by frontend).
        This generates deep, diverse follow-up questions.
        history already contains the 5 basic Q&A pairs + any previous deep Q&A.
        """
        count = len(history)
        deep_count = count - 11  # Frontend handles 11 basic questions first

        # Hard cap: after 10 AI deep questions (15 total), force stop
        if deep_count >= 10:
            return {"question": "", "options": [], "is_final": True}

        # Build a summary of what's been asked to prevent repetition
        asked_topics = []
        for h in history:
            asked_topics.append(f"- 问: {h.get('question', '')[:30]}... 答: {h.get('answer', '')[:30]}...")
        asked_summary = "\n".join(asked_topics)

        # Suggest different dimensions based on deep_count
        dimension_suggestions = [
            "对方的性格特点、口头禅或标志性习惯",
            "你们之间最难忘的一个具体瞬间或故事",
            "对方在新的一年里面临的挑战或期待",
            "你最欣赏对方的一个品质是什么",
            "如果用一个词/一句话总结你们的关系",
            "对方有什么爱好或特长值得在祝福中提到",
            "你想在祝福里埋一个只有你们才懂的梗或暗号吗",
            "对方的家庭近况（如有孩子、父母身体等）",
            "你希望这段祝福传递什么核心情感（感恩/鼓励/思念/期待）",
            "还有什么私密的话平时不好意思说，想借新年说出口",
        ]

        # Pick the suggested dimension for this round
        current_suggestion = dimension_suggestions[min(deep_count, len(dimension_suggestions) - 1)]

        prompt = f"""你是2026丙午马年的春节祝福定制大师。用户正在为好友"{contact_name}"定制一份走心的拜年祝福。

【重要：已有信息摘要，你绝对不能重复这些话题】
{asked_summary}

【你现在需要挖掘的新维度】
建议方向：{current_suggestion}

【你的任务】
1. 提出一个全新的、具体的问题。这个问题必须和之前所有问题完全不同。
2. 问题要贴近春节气氛，可以用"新春之际"、"辞旧迎新"、"策马奔腾"等词汇点缀。
3. 提供 4-5 个生动有趣的选项，每个选项都要有画面感。
4. 这是第 {deep_count + 1} 个深度问题。
   - 如果 deep_count < 5：必须继续，is_final 设为 false。
   - 如果 deep_count >= 5 且 deep_count < 8：如果觉得素材已经非常丰富，可以设 is_final 为 true。
   - 如果 deep_count >= 8：设 is_final 为 true。

仅返回 JSON，不要有其他内容：
{{
  "question": "你的新问题",
  "options": ["选项1", "选项2", "选项3", "选项4"],
  "is_final": false
}}"""

        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.9
            )
            content = response.choices[0].message.content.strip()

            # Extract JSON robustly
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                question = data.get("question", "")
                options = data.get("options", [])
                is_final = data.get("is_final", False)

                # Safety: force is_final if question is empty
                if not question:
                    is_final = True

                return {
                    "question": question,
                    "options": options if isinstance(options, list) else [],
                    "is_final": is_final
                }

            # Fallback if JSON parse fails
            return {
                "question": current_suggestion + "？",
                "options": ["是的，想提一下", "不太需要", "让我想想", "跳过这个"],
                "is_final": False
            }
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            logger.warning(f"[AI Deep Question Parse Error] {e}", exc_info=True)
            if deep_count >= 3:
                return {"question": "", "options": [], "is_final": True}
            return {
                "question": f"在新春之际，关于{contact_name}，还有什么想补充的吗？",
                "options": ["补充一些细节", "差不多了，开始生成吧"],
                "is_final": False
            }
        except (AuthenticationError, RateLimitError, APIError, APITimeoutError) as e:
            logger.error(f"[AI API Error in get_next_question] {e.__class__.__name__}: {e}")
            if deep_count >= 3:
                return {"question": "", "options": [], "is_final": True}
            return {
                "question": f"在新春之际，关于{contact_name}，还有什么想补充的吗？",
                "options": ["补充一些细节", "差不多了，开始生成吧"],
                "is_final": False
            }
        except Exception as e:
            logger.error(f"[Unexpected Error in get_next_question] {e}", exc_info=True)
            if deep_count >= 3:
                return {"question": "", "options": [], "is_final": True}
            return {
                "question": f"在新春之际，关于{contact_name}，还有什么想补充的吗？",
                "options": ["补充一些细节", "差不多了，开始生成吧"],
                "is_final": False
            }

    def generate_final_greeting(self, contact_name: str, history: list, model: str = "deepseek/deepseek-v3.2") -> str:
        """Generates the final greeting using the full interview history."""
        history_text = self._format_history(history)

        prompt = f"""请根据以下访谈记录，为"{contact_name}"生成一段极其真诚、深度个性化的2026丙午马年春节祝福语。

【访谈记录】
{history_text}

【要求】
1. 必须是2026丙午马年的春节祝福，要有浓郁的新年气息。
2. 适当融入马年元素（如：马到成功、策马扬鞭、龙马精神、一马当先等，但不要堆砌）。
3. 绝对文案级水平，拒绝套话，必须融入访谈中提到的具体细节和故事。
4. 根据用户选择的风格（正式/幽默/煽情等）调整语气。
5. 根据用户选择的长度要求调整字数，如无特殊要求则在 100-200 字左右。
6. 直接输出祝福语正文，不要有"以下是为您生成的祝福语"等前缀。
"""
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.8
            )
            return response.choices[0].message.content.strip()
        except (AuthenticationError, RateLimitError, APIError, APITimeoutError) as e:
            logger.error(f"[AI API Error in generate_final_greeting] {e.__class__.__name__}: {e}")
            return "生成失败，请检查 API Key 或稍后重试"
        except Exception as e:
            logger.error(f"[Unexpected Error in generate_final_greeting] {e}", exc_info=True)
            return "生成失败，请稍后重试"

    def _format_history(self, history: list) -> str:
        if not history:
            return "（无历史记录）"
        lines = []
        for i, h in enumerate(history):
            lines.append(f"问{i+1}: {h.get('question', '未知问题')}")
            lines.append(f"答{i+1}: {h.get('answer', '未回答')}")
        return "\n".join(lines)

    def generate_greeting(self, contact_name: str, answers: dict, model: str = "deepseek/deepseek-v3.2") -> str:
        # Legacy compatibility
        return self.generate_final_greeting(contact_name, [{"question": "基础信息", "answer": str(answers)}], model)

    def validate_key(self) -> tuple[bool, str]:
        try:
            self.client.models.list()
            return True, "API Key valid"
        except AuthenticationError:
            logger.warning("API Key authentication failed")
            return False, "Invalid API Key"
        except RateLimitError:
            logger.warning("API rate limit exceeded during validation")
            return False, "Rate limit exceeded"
        except (APIError, APITimeoutError) as e:
            logger.warning(f"API error during validation: {e}")
            return False, "API service unavailable"
        except Exception as e:
            logger.error(f"Unexpected error during key validation: {e}", exc_info=True)
            return False, "Validation failed"
