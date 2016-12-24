import spacy
import io
import logging
import os

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
        load the text and create spacy nlp object
        """
        self.logger.info("Parsing text")
        self.doc = self.nlp(text)
        
    def corpus_to_list(self, path):
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
                corpora[name] = self.corpus_to_list(os.path.join(root,name))
        return corpora

    def match_corpus(self,corpus):
        """
        Calls corpus_to_list method to get words from corpus and returns list of (index,token) match with tokens in self.doc 
        """
        words = self.corpora[corpus]
        self.logger.info("Matching document with corpus %s",corpus)
        match = [(token.i,token) for token in self.doc if token.text in words]
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
                    replace.append((token.i,token,word,token.similarity(word)))
        return replace

    def passive_sents(self):
        """
        Find passive sentences in document and return a list of those sentences
        """
        passive = list()
        sentences = [sents for sents in self.doc.sents]
        self.logger.info("Finding passive sentences")
        for sent in sentences:
            for token in sent:
                if token.head.tag_ == "VBN" and token.dep_ == "auxpass":
                    passive.append(sent)
        return passive

    def adverb_tokens(self):
        """
        """
        self.logger.info("Identifying adverbs in the document")
        return [(token.i,token) for token in self.doc if token.pos_ == "ADV" and token.dep_ == "advmod"]

    def modal_tokens(self):
        """
        Verb modifiers signifying ability or necessity. They can weaken statements by making them uncertain or too radical.
        """
        self.logger.info("Identifying modal verbs")
        return [(token.i,token) for token in self.doc if token.tag_ == "MD"]


if __name__ == "__main__":
    a = TextAnalyzer()
    file = io.open('text.txt','r',encoding='utf8').read()
    a.parse(file)
    print(a.noun_cluster())
    # print(a.adverb_tokens())
    # print(a.modal_tokens())
    # print(a.passive_sents())
    # print(a.match_corpus('weakverb'))
    # print(a.match_corpus('filler'))
    # print(a.replacable_from_corpus('visual'))
    # print(a.replacable_from_corpus('tasteandsmell'))
    # print(a.replacable_from_corpus('tactile'))
    # print(a.replacable_from_corpus('motion'))
    # print(a.replacable_from_corpus('auditory'))