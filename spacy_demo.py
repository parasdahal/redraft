from __future__ import unicode_literals
import spacy

nlp = spacy.load('en')
text = open('text.txt').read()
doc = nlp(text.decode('utf8'))
# tokens
tokens = [token for i,token in enumerate(doc)]
print(tokens)
# sentences
sentences = [sent for sent in doc.sents]
print(sentences)

# pos
for word in doc:
    print(word.text, word.lemma, word.lemma_, word.tag, word.tag_, word.pos, word.pos_)

# entity recognizer
for word in doc:
    print(word.text, word.ent_type_)

# word vector similarity
king = nlp(u'king')
monarch = nlp(u'monarch')
king_vec = king.vector
king.similarity(monarch) # cosine similarity

#matching
from spacy.matcher import Matcher
matcher = Matcher(nlp.vocab)
matcher.add_pattern("Helloworld",[{LOWER:"hello"},{IS_PUNCT:True},{LOWER:"world"}])

doc = nlp(u'Hello, world!')
matches = matcher(doc)
