from __future__ import unicode_literals
import spacy
import io
import logging
import os
import pyphen

class TextAnalyzer:
    """
    This class performs metric calculations for a given document and returns a metric object
    """

    def __init__(self):
        """
        Initialize the class, set logging and load spacy
        """
        logging.basicConfig(level=logging.INFO,format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        self.logger = logging.getLogger("TextAnalyzer")

        self.logger.info("Loading corpora")
        self.corpora =self.load_corpora(path="corpus")
        
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
        self.words = [token for token in self.doc if token.is_punct == False and token.is_space == False]
        self.stats = self.__stats()
        return self.stats
        
    def __stats(self):
        """
        Calculate basic stats about the document
        """
        stats = {}
        hp = pyphen.Pyphen(lang='en')
        syllable_per_word = [len(hp.positions(word.lower_))+1 for word in self.words]
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
    
    def load_corpora(self,path="corpus"):
        """
        Loads the corpuses in corpus directory and returns a corpora dictionary
        """
        corpora = dict()
        for root,dir,files in os.walk(path):
            for name in files:
                corpora[name] = self.__corpus_to_list(os.path.join(root,name))
        return corpora

    def match_corpus(self,corpus):
        """
        Calls corpus_to_list method to get words from corpus and returns list of (index,token) match with tokens in self.doc 
        """
        words = self.corpora[corpus]
        self.logger.info("Matching document with corpus %s",corpus)
        match = [{"index":token.i,"token":token.text} for token in self.doc if token.text in words]
        return match
    
    def replacable_from_corpus(self,corpus):
        """
        Find tokens in document that can be replaced by corpus words 
        """
        replace = list()
        words = self.corpora[corpus]
        self.logger.info("Finding replacable tokens from corpus %s",corpus)
        word_tokens = [self.nlp(word) for word in words]
        for token in self.doc:
            for word in word_tokens:
                if token.similarity(word) > 0.75 and token.similarity(word) <0.99:
                    replace.append({"index":token.i,"token":token.text,"replace":word.text,"similarity":token.similarity(word)})
        return replace
    
    def long_sent(self):
        """
        """
        self.logger.info("Finding long sentences")
        return [{"start":sent.start,"end":sent.end,"sent":sent.text} for sent in self.sents if len(sent) > 40]

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
                    passive.append({"start":sent.start,"end":sent.end,"sent":sent.text})
        return passive

    def adverb_tokens(self):
        """
        """
        self.logger.info("Identifying adverbs in the document")
        return [{"index":token.i,"token":token.text} for token in self.doc if token.pos_ == "ADV" and token.dep_ == "advmod"]

    def modal_tokens(self):
        """
        Verb modifiers signifying ability or necessity. They can weaken statements by making them uncertain or too radical.
        """
        self.logger.info("Identifying modal verbs")
        return [{"index":token.i,"token":token.text} for token in self.doc if token.tag_ == "MD"]