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
    stats = analyzer.parse(text)
    sensory = {
        "visual":analyzer.replacable_from_corpus('visual'),
        "tasteandsmell":analyzer.replacable_from_corpus('tasteandsmell'),
        "tactile":analyzer.replacable_from_corpus('tactile'),
        "motion":analyzer.replacable_from_corpus('motion'),
        "auditory":analyzer.replacable_from_corpus('auditory')
    }
    response = {
        "stats":stats,
        "long_sents":analyzer.long_sent(),
        "adverbs":analyzer.adverb_tokens(),
        "passive_sents":analyzer.passive_sents(),
        "fuzzy_sents":analyzer.distant_sub_verb(),
        "modal":analyzer.modal_tokens(),
        "weakverbs":analyzer.match_corpus('weakverb'),
        "sensory":sensory,
        "frequent_words":analyzer.frequent_words(),
        "grammar_expletives":analyzer.grammar_expletives(),
        "nomilization": analyzer.nominalization(),
        "suggestions":analyzer.suggestions()
    }
    return json.dumps(response, ensure_ascii=False)


def create_app():
    """
    Creating the routing app
    """
    global analyzer
    analyzer = TextAnalyzer()
    return app
