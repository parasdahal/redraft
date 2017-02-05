from flask import Flask,request
import json
from textanalyzer import TextAnalyzer
app = Flask(__name__)

@app.route("/analyze", methods=["POST"])
def analyze():
    """
    Main analysis route
    """
    text = request.form['text']
    analyzer.parse(text)
    response = {
        "adverb":{
            "title":"Adverb",
            "description":"You can almost always remove the adverb and pick a more accurate verb.",
            "instances":analyzer.adverb_tokens()
        },
        "passive":{
            "title":"Passive Voice",
            "description":"Often, sentences in passive voice sound weak and can be confusing. If so, rephrase the sentence in active voice.",
            "instances":analyzer.passive_sents()
        },
        "modal":{
            "title":"Modal",
            "description":"Verb modifiers signifying ability or necessity. They can weaken statements by making them uncertain or too radical.",
            "instances":analyzer.modal_tokens()
        },
        "fuzzysents":{
            "title":"Vague Sentences",
            "description":"Sentences with subject and verb distant from each other. Bring the subject and verbs to start of the sentence if possible.",
            "instances":analyzer.distant_sub_verb(),
        },
        "weakverb":{
            "title":"Weak Verb",
            "description":"These words don't trigger vivid imagery in reader's heads and usually require additional words to deliver a meaningful message. Substituting weak verbs with more specific ones will liven most texts.",
            "instances":analyzer.match_corpus('weakverb')
        },
        "expletives":{
            "title":"Grammar Expletives",
            "description":"When it, here, and there refer to nouns later in the sentence or to something unnamed, they weaken your writing by shifting emphasis away from the true drivers of your sentences.",
            "instances":analyzer.grammar_expletives()
        },
        "nominalization":{
            "title":"Nominalization",
            "description":"Complex nouns extended from shorter verbs, adjectives and nouns. They often slow a reader down and may be hard to interpret.  Try to rearrange the sentence to use the original shorter and more lively version of the word.",
            "instances":analyzer.nominalization()
        },
        "suggestions":{
            "title":"Common Suggestions",
            "description":"Various different suggestions to improve the prose of your writing",
            "instances":analyzer.suggestions()
        },
        "visual":{
            "title":"Visual Sensory Word",
            "description":"Words related to sight indicate colors, shape, or appearance. For instance: gloomy, dazzling, bright, foggy, gigantic",
            "instances":analyzer.replacable_from_corpus('visual')
        },
        "tasteandsmell":{
            "title":"Taste and Smell Sensory Word",
            "description":"Taste and smell are closely related. Most taste and smell words are easy substitutes for bland words like good, nice, or bad. For instance: zesty, tantalizing, sweet, stinky, stale.",
            "instances":analyzer.replacable_from_corpus('tasteandsmell')
        },
        "touch":{
            "title":"Touch Sensory Word",
            "description":"Words related to touch describe textures. You can use them to describe feelings and abstract concepts, too: gritty, creepy, slimy, fluff, sticky.",
            "instances":analyzer.replacable_from_corpus('tactile')
        },
        "motion":{
            "title":"Motion Sensory Word",
            "description":"By using active words or describing movement, you help your readers experience your words. For instance: vibrating, soaring, mind-boggling, staggering, bumpy.",
            "instances":analyzer.replacable_from_corpus('motion')
        },
        "auditory":{
            "title":"Auditory Sensory Word",
            "description":"Words related to hearing describe sounds. For instance: crashing, thumping, piercing, tingling, squeaky. Often these words mimic sounds.",
            "instances":analyzer.replacable_from_corpus('auditory')
        },
        "longsents":{
            "title":"Extra Long Sentences",
            "description":"Sentences with 40 or more words. They might be too hard to understand. If so, break them down into several smaller sentences.",
            "instances":analyzer.long_sent()
        }
    }
    return json.dumps(response, ensure_ascii=False)


def create_app():
    """
    Creating the routing app
    """
    global analyzer
    analyzer = TextAnalyzer()
    return app
