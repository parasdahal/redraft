import React from 'react';
import {Editor,EditorState,ContentState,RichUtils,convertToRaw,convertFromRaw,SelectionState,Modifier,Entity,CompositeDecorator} from 'draft-js';
import ReactDOM from 'react-dom';
import decorator from './decorator.js'
import StyleButton from './styleButton';
import axios from 'axios';
import Immutable from 'immutable';

/**
 * Content initialized in the editor
 */
const rawContent = {"entityMap":{},"blocks":[{"key":"arjcf","text":"It’s about all things being equal exhausting to continuously criticize your work, telling yourself you can do better. It’s exhausting to keep on thinking whether your work is good enough for people’s judgmental eyes.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"7dtph","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"epid5","text":"I’ve always had the compulsive need to demonstrate my work only when it felt perfect. Only when it felt polished. Only when I was sure it would impress everyone.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"b1e78","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"3pphh","text":"I can clearly see now that this need for perfection is an illusion. Like a mirage in the desert. You can never truly create something perfect. It won’t be perfect for everybody. Obsessing over perfection makes you vulnerable and kills your creativity. It might feed your ambition but will feast on your fear of rejection.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"ucfq","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"6ljtu","text":"Also, everything you make will be criticized, or else ignored.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"2fmfq","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"cb0jm","text":"But it’s okay. ","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":14,"style":"ITALIC"}],"entityRanges":[],"data":{}},{"key":"erbt7","text":"I’d rather be criticized than ignored.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}]};

/**
 * URL for analysis API
 */
const API_URL = "http://localhost:8888/analyze";


export default class App extends React.Component{

    constructor(props)
    {
        super(props);
        /**
         * Entity key map 
         */
        this.suggestionEntityKeys = {
            modal:Entity.create('modal', 'IMMUTABLE', {suggestion: 'Remove modals they are bad.'}),
            adverbs:Entity.create('adverbs','IMMUTABLE', {suggestion: 'Yucks adverbs they are path to hell.'}),
        };

        this.state ={editorState: EditorState.createWithContent(convertFromRaw(rawContent),decorator)};
        
        /**
         * Binding methods to the class
         */
        this.onChange = (editorState) => this.setState({editorState});
        this.handleKeyCommand = (command) => this._handleKeyCommand(command);
        this.toggleBlockType = (type) => this._toggleBlockType(type);
        this.getSuggestion = () => this._getSuggestion();
        this.getBlockKeys = this.getBlockKeys.bind(this);

        const {editorState} = this.state;
        this.logState = () => {const content = this.state.editorState.getCurrentContent();console.log(convertToRaw(content));};
    }


    _handleKeyCommand(command)
    {
        const newState = RichUtils.handleKeyCommand(this.state.editorState,command);
        if(newState)
        {
            this.onChange(newState);
            return 'handled';
        }
        return 'not-handled';
    }

    _toggleBlockType(blockType)
    {
        this.onChange(
            RichUtils.toggleBlockType(
                this.state.editorState,
                blockType
            )
        );
    }

    getBlockKeys(start,end)
    {
        var keyBlocks = [];
        var count =0;
        var blocks = this.state.editorState.getCurrentContent().getBlocksAsArray()
        // create an array of {key,start,end,text} for each block
        for(var i=0;i<blocks.length;i++)
        {
            var len = blocks[i].text.length;
            keyBlocks.push({
                index:i,
                key:blocks[i].key,
                start:count,
                end:count+len,
                text:blocks[i].text
            });
            count+=len;
        }
        var blocks = [];
        // create an array of keys of the blocks for tokens with start and end values
        for(var i=0;i<keyBlocks.length;i++)
        {
            if(start >= keyBlocks[i].start && end <= keyBlocks[i].end )
            {
                 blocks.push({
                     index:keyBlocks[i].index,
                     key:keyBlocks[i].key,
                     startOffset:keyBlocks[i].start,
                     endOffset:keyBlocks[i].end
                    });

            }   
        }
        return blocks;
    }

    _getSuggestion()
    {
        var server = {"modal": [{"index": 17, "token": "can", "end": 106, "start": 103}, {"index": 69, "token": "would", "end": 361, "start": 356}, {"index": 75, "token": "can", "end": 386, "start": 383}, {"index": 96, "token": "can", "end": 485, "start": 482}, {"index": 104, "token": "won’t", "end": 532, "start": 527}, {"index": 122, "token": "might", "end": 641, "start": 636}, {"index": 127, "token": "will", "end": 669, "start": 665}, {"index": 141, "token": "will", "end": 734, "start": 730}],"adverbs": [{"index": 9, "token": "continuously", "end": 60, "start": 48}, {"index": 19, "token": "better", "end": 116, "start": 110}, {"index": 33, "token": "enough", "end": 186, "start": 180}, {"index": 42, "token": "always", "end": 229, "start": 223}, {"index": 51, "token": "only", "end": 281, "start": 277}, {"index": 52, "token": "when", "end": 286, "start": 282}, {"index": 57, "token": "Only", "end": 308, "start": 304}, {"index": 58, "token": "when", "end": 313, "start": 309}, {"index": 63, "token": "Only", "end": 336, "start": 332}, {"index": 64, "token": "when", "end": 341, "start": 337}, {"index": 76, "token": "clearly", "end": 394, "start": 387}, {"index": 78, "token": "now", "end": 402, "start": 399}, {"index": 98, "token": "truly", "end": 497, "start": 492}, {"index": 136, "token": "Also", "end": 708, "start": 704}, {"index": 146, "token": "else", "end": 757, "start": 753}, {"index": 157, "token": "rather", "end": 794, "start": 788}]};
        
        var selectionStates = []
        Object.keys(server).forEach((key) => {
            var tokens = server[key];
            tokens.map((token) => {
                var blocks = this.getBlockKeys(token.start,token.end);
                blocks.map((block) => {
                        
                        var selectionState = SelectionState.createEmpty(block.key);
                        var start = token.start - block.startOffset - block.index;
                        var end = start + (token.end - token.start);
                        var updatedSelection = selectionState.merge({
                            anchorOffset:start,
                            focusOffset:end,
                        });
                        selectionStates.push({
                            entity:key,
                            selection:updatedSelection
                        });
                        
                });
            });
        });
        var editorState = this.state.editorState;
        var content = this.state.editorState.getCurrentContent();
        selectionStates.map((item)=>{
                var entity = item.entity;
                var entityKey = this.suggestionEntityKeys[entity];
                content = Modifier.applyEntity(
                            content,
                            item.selection,
                            entityKey
                );
        })  
        this.setState({editorState: EditorState.createWithContent(content,decorator)});

    }
    
    render()
    {
        const {editorState} = this.state;
        return(
                <div className="editor">
                <button onClick={this.getSuggestion}>Edit</button>
                <button onClick={this.logState}>Log State</button>
                       <BlockStyleControls editorState={editorState} onToggle={this.toggleBlockType}/>
                       <Editor
                            editorState={this.state.editorState}
                            handleKeyCommand={this.handleKeyCommand}
                            onChange={this.onChange}
                            spellCheck = {true}
                        />
                </div>
        );
    }

}

const BLOCK_TYPES = [
    {label: 'H1', style: 'header-one'},
    {label: 'H2', style: 'header-two'},
    {label: 'H3', style: 'header-three'},
    {label: 'Quote', style: 'blockquote'},
    {label: 'Bullets', style: 'unordered-list-item'},
    {label: 'Numbers', style: 'ordered-list-item'},
];

const BlockStyleControls = (props) => {
    const {editorState} = props;
    const selection = editorState.getSelection();
    const blockType = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType();

    return (
        <div className="RichEditor-controls">
            {BLOCK_TYPES.map((type) =>
                <StyleButton
                    key={type.label}
                    active={type.style === blockType}
                    label={type.label}
                    onToggle={props.onToggle}
                    style={type.style}
                />
            )}
        </div>
    );
};