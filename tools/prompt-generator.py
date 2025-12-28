#!/usr/bin/env python3
"""
摄影提示词批量生成器
Photography Prompt Batch Generator

用法 / Usage:
    python prompt-generator.py
    python prompt-generator.py --count 10 --output prompts.txt
"""

import random
import argparse
from datetime import datetime

# ============================================================
# 配置区域 - 根据需要修改这些选项
# ============================================================

SUBJECTS = [
    "a fit young woman",
    "a elegant woman in her 30s",
    "a confident young woman",
    "a graceful female model",
]

LOCATIONS = [
    {
        "name": "luxury yacht deck",
        "setting": "standing on the deck of a white luxury yacht, casually leaning back against the railing. Both hands rest naturally on the railing edge. Her legs are slightly crossed at the ankles, feet flat on the deck",
        "background": "a vast deep-blue ocean with natural surface texture, a distant coastline with rolling hills, and a clear, bright blue sky",
        "details": "smooth white surfaces, subtle shadows, clean railing lines, and visible deck edges"
    },
    {
        "name": "beach resort",
        "setting": "standing on a pristine white sand beach, one hand lightly touching her hip, the other relaxed at her side. Weight shifted to one leg in a natural, relaxed pose",
        "background": "crystal clear turquoise water, palm trees swaying gently, and a gradient sky from light blue to soft orange",
        "details": "fine white sand, gentle wave foam at shoreline, distant beach umbrellas"
    },
    {
        "name": "infinity pool",
        "setting": "sitting on the edge of an infinity pool, legs dangling in the water, hands placed casually on the pool edge, looking over her shoulder toward the camera",
        "background": "panoramic ocean view merging with pool edge, tropical vegetation, golden hour sky",
        "details": "crystal clear pool water, wet tile reflections, subtle water ripples"
    },
    {
        "name": "rooftop terrace",
        "setting": "leaning against a modern glass railing on a luxury rooftop terrace, arms loosely crossed, city skyline behind her",
        "background": "dramatic urban skyline at sunset, distant skyscrapers with glowing windows, soft clouds",
        "details": "sleek modern furniture, ambient string lights, polished floor tiles"
    },
]

SWIMWEAR = [
    {
        "type": "metallic electric blue one-piece swimsuit",
        "details": "high-leg cut and thin straps. The fabric has a realistic metallic sheen that reflects sunlight subtly without appearing glossy or artificial"
    },
    {
        "type": "classic black bikini",
        "details": "simple elegant cut with gold ring accents. Matte fabric with subtle texture"
    },
    {
        "type": "white one-piece swimsuit",
        "details": "plunging neckline with tasteful coverage, ribbed texture fabric with natural stretch"
    },
    {
        "type": "coral red two-piece swimsuit",
        "details": "bandeau top with high-waisted bottom, soft matte fabric with delicate ruching"
    },
    {
        "type": "emerald green one-piece",
        "details": "asymmetric single-shoulder design, silky fabric with subtle sheen"
    },
]

ACCESSORIES = [
    "a gold chain necklace, stacked bracelets on both wrists, and dark sunglasses with a clean modern frame",
    "delicate gold hoop earrings, a thin anklet, and oversized tortoiseshell sunglasses",
    "layered gold necklaces, a single statement ring, and cat-eye sunglasses",
    "pearl stud earrings, a elegant watch, and rimless sunglasses",
    "bohemian layered bracelets, small pendant necklace, and round retro sunglasses",
]

LIGHTING = [
    {
        "name": "midday sun",
        "desc": "strong, natural midday sunlight with crisp, directionally correct shadows falling consistently across the subject and surfaces"
    },
    {
        "name": "golden hour",
        "desc": "warm golden hour sunlight casting long, soft shadows, with a gentle warm glow on skin and surfaces"
    },
    {
        "name": "soft overcast",
        "desc": "soft diffused daylight from overcast sky, creating even lighting with minimal harsh shadows"
    },
    {
        "name": "backlit sunset",
        "desc": "dramatic backlit sunset lighting creating a subtle rim light around the subject, with warm fill light on the front"
    },
]

CAMERA_SETTINGS = [
    "eye-level, full-frame 50mm lens equivalent, no distortion",
    "slightly below eye-level, full-frame 35mm lens, natural perspective",
    "eye-level, full-frame 85mm portrait lens, subtle background compression",
]

STYLE_SUFFIX = """Colors are vibrant yet realistic. Style is high-end summer luxury travel photography, editorial realism, ultra-realistic detail, natural skin texture, no CGI artifacts, no filters, no artificial blur."""

# ============================================================
# 生成器函数
# ============================================================

def generate_prompt(
    subject=None,
    location=None,
    swimwear=None,
    accessories=None,
    lighting=None,
    camera=None
):
    """生成单个完整的摄影提示词"""

    # 随机选择或使用指定值
    subj = subject or random.choice(SUBJECTS)
    loc = location or random.choice(LOCATIONS)
    swim = swimwear or random.choice(SWIMWEAR)
    acc = accessories or random.choice(ACCESSORIES)
    light = lighting or random.choice(LIGHTING)
    cam = camera or random.choice(CAMERA_SETTINGS)

    prompt = f"""If a reference image exists, use the subject in the image as the only subject. If no reference image exists, use {subj}. Preserve realistic human anatomy, natural body proportions, and correct limb lengths. No stylization, no exaggeration, no distortion.

Capture a full-body lifestyle photography shot with correct spatial scale. The subject is {loc['setting']}. The subject's height, limb proportions, and head-to-body ratio must be consistent with real human scale relative to the environment.

Camera perspective is {cam}. The environment scale aligns naturally with the subject's body, clearly establishing scale and realism.

She is wearing a {swim['type']} with {swim['details']}. Accessories include {acc}.

The scene shows realistic details: {loc['details']}. Background features {loc['background']}.

Lighting is {light['desc']}. {STYLE_SUFFIX}"""

    return prompt, {
        "subject": subj,
        "location": loc["name"],
        "swimwear": swim["type"],
        "lighting": light["name"]
    }


def generate_batch(count=5, output_file=None):
    """批量生成提示词"""
    prompts = []

    print(f"\n{'='*60}")
    print(f"  摄影提示词批量生成器 | Photography Prompt Generator")
    print(f"  生成数量: {count}")
    print(f"{'='*60}\n")

    for i in range(count):
        prompt, meta = generate_prompt()
        prompts.append({
            "id": i + 1,
            "prompt": prompt,
            "meta": meta
        })

        print(f"[{i+1}/{count}] {meta['location']} | {meta['swimwear'][:30]}... | {meta['lighting']}")

    # 保存到文件
    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(f"# Generated Prompts - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"# Total: {count} prompts\n\n")

            for p in prompts:
                f.write(f"{'='*60}\n")
                f.write(f"## Prompt {p['id']}\n")
                f.write(f"Location: {p['meta']['location']}\n")
                f.write(f"Swimwear: {p['meta']['swimwear']}\n")
                f.write(f"Lighting: {p['meta']['lighting']}\n")
                f.write(f"{'='*60}\n\n")
                f.write(p['prompt'])
                f.write(f"\n\n{'~'*60}\n\n")

        print(f"\n✅ 已保存到: {output_file}")

    return prompts


def interactive_mode():
    """交互模式 - 自定义生成"""
    print("\n🎨 交互模式 - 自定义提示词生成\n")

    # 选择场景
    print("选择场景 / Select Location:")
    for i, loc in enumerate(LOCATIONS):
        print(f"  [{i+1}] {loc['name']}")
    loc_choice = input("输入编号 (回车随机): ").strip()
    location = LOCATIONS[int(loc_choice)-1] if loc_choice.isdigit() and 0 < int(loc_choice) <= len(LOCATIONS) else None

    # 选择泳装
    print("\n选择泳装 / Select Swimwear:")
    for i, swim in enumerate(SWIMWEAR):
        print(f"  [{i+1}] {swim['type']}")
    swim_choice = input("输入编号 (回车随机): ").strip()
    swimwear = SWIMWEAR[int(swim_choice)-1] if swim_choice.isdigit() and 0 < int(swim_choice) <= len(SWIMWEAR) else None

    # 选择光线
    print("\n选择光线 / Select Lighting:")
    for i, light in enumerate(LIGHTING):
        print(f"  [{i+1}] {light['name']}")
    light_choice = input("输入编号 (回车随机): ").strip()
    lighting = LIGHTING[int(light_choice)-1] if light_choice.isdigit() and 0 < int(light_choice) <= len(LIGHTING) else None

    # 生成
    prompt, meta = generate_prompt(
        location=location,
        swimwear=swimwear,
        lighting=lighting
    )

    print(f"\n{'='*60}")
    print("生成的提示词 / Generated Prompt:")
    print(f"{'='*60}\n")
    print(prompt)
    print(f"\n{'='*60}\n")

    # 复制提示
    save = input("保存到文件? (输入文件名或回车跳过): ").strip()
    if save:
        filename = save if save.endswith('.txt') else f"{save}.txt"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(prompt)
        print(f"✅ 已保存到: {filename}")


def main():
    parser = argparse.ArgumentParser(description='摄影提示词批量生成器')
    parser.add_argument('--count', '-c', type=int, default=5, help='生成数量 (默认: 5)')
    parser.add_argument('--output', '-o', type=str, help='输出文件路径')
    parser.add_argument('--interactive', '-i', action='store_true', help='交互模式')

    args = parser.parse_args()

    if args.interactive:
        interactive_mode()
    else:
        prompts = generate_batch(args.count, args.output)

        if not args.output:
            print("\n提示: 使用 --output 参数保存到文件")
            print("示例: python prompt-generator.py -c 10 -o my_prompts.txt\n")

            # 显示第一个完整提示词作为示例
            print(f"{'='*60}")
            print("示例提示词 #1:")
            print(f"{'='*60}\n")
            print(prompts[0]['prompt'])


if __name__ == "__main__":
    main()
