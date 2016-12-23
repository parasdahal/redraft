import spacy
import io
import logging

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

        self.logger.info("Loading Spacy")
        self.nlp = spacy.load('en')
        self.logger.info("Spacy loaded")

    def parse(self, text):
        """
        load the text and create spacy nlp object
        """
        self.logger.info("Parsing text")
        self.doc = self.nlp(text)
        
    def load_corpus(self, path):
        """
        Loads the corpus and returns a list of words on the corpus
        """
        words = list()
        with io.open(path,'r',encoding='utf8') as corp:
        	words = [word.rstrip('\n').lower() for word in corp]
        return words

    def match_corpus(self,path):
        """
        Calls load_corpus method to get words from corpus and returns list of (index,token) match with tokens in self.doc 
        """
        words = self.load_corpus(path)
        self.logger.info("Matching document with corpus %s",path)
        match = [(token.i,token) for token in self.doc if token.text in words]
        return match

a = TextAnalyzer()
file = io.open('text.txt','r',encoding='utf8').read()
a.parse(file)
print(a.match_corpus('corpus/weakverb'))
print(a.match_corpus('corpus/filler'))
