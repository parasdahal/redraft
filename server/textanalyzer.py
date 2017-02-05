from __future__ import unicode_literals
import spacy
from spacy.matcher import PhraseMatcher
import io
import logging
import os
import pyphen
from collections import Counter

class TextAnalyzer:
    """
    This class performs metric calculations for a given document and returns a metric object
    """
    FREQUENT_DENSITY_THRESHOLD = 40.0
    VECTOR_SIMILARITY_THRESHOLD = 0.75
    LONG_SENT_TOKEN_COUNT_THRESHOLD = 40

    def __init__(self):
        """
        Initialize the class, set logging and load spacy
        """
        logging.basicConfig(level=logging.INFO,format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        self.logger = logging.getLogger("TextAnalyzer")

        self.logger.info("Loading corpora")
        self.corpora =self.__load_corpora(path="corpus")
        
        self.logger.info("Loading Spacy")
        self.nlp = spacy.load('en')
        self.logger.info("Spacy loaded")

    def parse(self, text):
        """
        load the text and create spacy nlp object and returns stats
        """
        self.logger.info("Parsing text")
        self.doc = self.nlp(text)
        self.sents = [sent for sent in self.doc.sents]
        self.words = [token.text for token in self.doc if token.is_punct == False and token.is_space == False]

    def __stats(self):
        """
        Calculate basic stats about the document
        """
        stats = {}
        hp = pyphen.Pyphen(lang='en')
        syllable_per_word = [len(hp.positions(word))+1 for word in self.words]
        stats["n_sents"] = len(self.sents)
        stats["n_words"] = len(self.words)
        stats["n_unique_words"] = len(set(self.words))
        stats["n_syllables"] = sum(syllable_per_word)
        stats["n_polysyllables"] = sum([1 for n in syllable_per_word if n >=3])
        stats["flesch_readability"] = 206.835 - 1.015 * (stats["n_words"]/stats["n_sents"]) - 84.6*(stats["n_syllables"]/stats["n_words"])
        return stats

    def __corpus_to_list(self, path):
        """
        Loads the corpus and returns a list of words on the corpus
        """
        words = list()
        with io.open(path,'r',encoding='utf8') as corp:
        	words = [word.rstrip('\n').lower() for word in corp]
        return words
    
    def __load_corpora(self, path="corpus"):
        """
        Loads the corpuses in corpus directory and returns a corpora dictionary
        """
        corpora = dict()
        for root,dir,files in os.walk(path):
            for name in files:
                corpora[name] = self.__corpus_to_list(os.path.join(root,name))
        return corpora

    def match_corpus(self, corpus):
        """
        Calls corpus_to_list method to get words from corpus and returns list of (index,token) match with tokens in self.doc 
        """
        words = self.corpora[corpus]
        self.logger.info("Matching document with corpus %s",corpus)
        match = [{"index":token.i,"start":token.idx,"end":token.idx+len(token),"token":token.text,"data":{"suggestion":"",remove:True}} for token in self.doc if token.text in words]
        return match
    
    def replacable_from_corpus(self, corpus):
        """
        Find tokens in document that can be replaced by corpus words 
        """
        replace = list()
        words = self.corpora[corpus]
        self.logger.info("Finding replacable tokens from corpus %s",corpus)
        word_tokens = [self.nlp(word) for word in words]
        for token in self.doc:
            for word in word_tokens:
                if token.similarity(word) > TextAnalyzer.VECTOR_SIMILARITY_THRESHOLD and token.similarity(word) <0.99:
                    replace.append({"index":token.i,"start":token.idx,"end":token.idx+len(token),"token":token.text,"data":{"replace":word.text,"suggestion":"Try replacing with following word","similarity":token.similarity(word),"remove":False}})
        return replace
    
    def long_sent(self):
        """
        Sentences with more than 40 tokens
        """
        self.logger.info("Finding long sentences")
        return [{"start":sent.start,"end":sent.end,"token":sent.text,"data":{"suggestion":"Break down to smaller sentences.","remove":False}} for sent in self.sents if len(sent) > TextAnalyzer.LONG_SENT_TOKEN_COUNT_THRESHOLD]

    def passive_sents(self):
        """
        Find passive sentences in document and return a list of those sentences
        """
        passive = list()
        sentences = [sents for sents in self.doc.sents]
        self.logger.info("Finding passive sentences")
        for sent in sentences:
            for token in sent:
                if token.head.tag_ == "VBN" and token.dep_ == "auxpass" and {"start":sent.start,"end":sent.end,"sent":sent.text} not in passive:
                    passive.append({"start":sent.start,"end":sent.end,"token":sent.text,"data":{"suggestion":"Restructure to passive voice","remove":False}})
        return passive

    def adverb_tokens(self):
        """
        adverbs and modifiers 
        """
        self.logger.info("Identifying adverbs in the document")
        return [{"index":token.i,"start":token.idx,"end":token.idx+len(token),"token":token.text,"data":{"suggestion":"Pick a more accurate verb","remove":True}} for token in self.doc if token.pos_ == "ADV" and token.dep_ == "advmod"]

    def modal_tokens(self):
        """
        Verb modifiers signifying ability or necessity. They can weaken statements by making them uncertain or too radical.
        """
        self.logger.info("Identifying modal verbs")
        return [{"index":token.i,"start":token.idx,"end":token.idx+len(token),"token":token.text} for token in self.doc if token.tag_ == "MD"]

    def distant_sub_verb(self):
        """
        The farther subject and verb are in the sentence the more fuzzier the sentence sounds
        """
        self.logger.info("Identifying sentences with distant subject and verb")
        return [{"start":s.start,"end":s.end,"token":s.text,"data":{"suggestion":"Restructure the sentence","remove":False}} for s in self.sents for token in s if token.pos_ == "VERB" and token.left_edge.dep_ =="nsubj" and len(s) > 7 and (token.i-token.left_edge.i)>(len(s)/2)]
    
    def frequent_words(self):
        """
        Returns the words with high density in the text
        """
        self.logger.info("Finding frequently used words")
        frequent = list()
        words = [token.text for token in self.doc if token.is_stop != True and token.is_punct != True]
        freq = Counter(words)
        num_tokens = len(words)
        common_words = freq.most_common(num_tokens)
        for word in common_words:
            density = (float(word[1])/num_tokens)*100
            if density > TextAnalyzer.FREQUENT_DENSITY_THRESHOLD:
                frequent.append(word)
        return frequent
    
    def grammar_expletives(self):
        """
        Grammar expletives are literary constructions that begin with it here or there
        """
        self.logger.info("Finding grammar expletives")
        exps = [u'There',u'It',u'Here']
        verb_to_be = ["VBP","VBN","VBD","VBZ"]
        exps_sents = [{"start":sent.start,"end":sent.end,"token":sent.text,"data":{"suggestion":"Restructure the sentence.","remove":False}} for sent in self.sents if sent[0].text in exps and sent[0].nbor().tag_ in verb_to_be]
        return exps_sents

    def nominalization(self):
        """
        Identify words with ion suffix
        """
        self.logger.info("Identifying nominalization")
        return [{"index":token.i,"start":token.idx,"end":token.idx+len(token),"token":token.text,"data":{"suggestion":"Use lively version of the word","remove":False}} for token in self.doc if token.suffix_ == "ion"]
    
    def suggestions(self):
        """
        """
        self.logger.info("Suggestion from the index")
        text = self.nlp(self.doc.text.lower())
        rules = list()
        with io.open('weakwriting','r',encoding='utf8') as doc:
            rules = [tuple(line.rstrip('\n').split('::')) for line in doc]
        rules = [(self.nlp(item[0].lower()),item[-1]) for item in rules ]
        rules_dict = dict()
        for key,val in rules:
            rules_dict[key.text]=val
        rules_phrases = [item[0] for item in rules]
        matcher = PhraseMatcher(self.nlp.vocab,rules_phrases)
        matches = matcher(text)
        result = list()
        for start,end,tag,label,m in matches:
            result.append({"start":start,"end":end,"token":label,"data":{"suggestion":rules_dict[label],"remove":True}})
        return result