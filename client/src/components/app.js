import React from 'react';
import {Editor,EditorState,ContentState,RichUtils,convertToRaw,convertFromRaw,SelectionState,Modifier,Entity} from 'draft-js';
import ReactDOM from 'react-dom';
import StyleButton from './styleButton';
import axios from 'axios';
import Immutable from 'immutable';

const rawContent = {"entityMap":{},"blocks":[{"key":"arjcf","text":"It’s about all things being equal exhausting to continuously criticize your work, telling yourself you can do better. It’s exhausting to keep on thinking whether your work is good enough for people’s judgmental eyes.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"7dtph","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"epid5","text":"I’ve always had the compulsive need to demonstrate my work only when it felt perfect. Only when it felt polished. Only when I was sure it would impress everyone.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"b1e78","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"3pphh","text":"I can clearly see now that this need for perfection is an illusion. Like a mirage in the desert. You can never truly create something perfect. It won’t be perfect for everybody. Obsessing over perfection makes you vulnerable and kills your creativity. It might feed your ambition but will feast on your fear of rejection.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"ucfq","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"6ljtu","text":"Also, everything you make will be criticized, or else ignored.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"2fmfq","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"cb0jm","text":"But it’s okay. ","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":14,"style":"ITALIC"}],"entityRanges":[],"data":{}},{"key":"erbt7","text":"I’d rather be criticized than ignored.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}]};

const API_URL = "http://localhost:8888/analyze";

const styleMap = {
    'modal':{
        backgroundColor:'green'
    }
};

export default class App extends React.Component{

    constructor(props)
    {
        super(props);
        this.state ={editorState: EditorState.createWithContent(convertFromRaw(rawContent))};
        this.onChange = (editorState) => this.setState({editorState});
        this.handleKeyCommand = (command) => this._handleKeyCommand(command);
        this.toggleBlockType = (type) => this._toggleBlockType(type);
        this.getSuggestion = () => this._getSuggestion();
        this.getBlockKeys = this.getBlockKeys.bind(this);

        this.modalEntityKey = Entity.create('modal','SEGMENTED');

        const {editorState} = this.state;
        this.logState = () => {
            const content = this.state.editorState.getCurrentContent();
            console.log(JSON.stringify(convertToRaw(content)));
        };

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
        var server = {"modal": [{"index": 17, "token": "can", "end": 106, "start": 103}, {"index": 68, "token": "would", "end": 360, "start": 355}, {"index": 73, "token": "can", "end": 384, "start": 381}, {"index": 94, "token": "can", "end": 483, "start": 480}, {"index": 102, "token": "won\'t", "end": 530, "start": 525}, {"index": 120, "token": "might", "end": 639, "start": 634}, {"index": 125, "token": "will", "end": 667, "start": 663}, {"index": 138, "token": "will", "end": 731, "start": 727}],"nomilization": [{"index": 81, "token": "perfection", "end": 430, "start": 420}, {"index": 84, "token": "illusion", "end": 445, "start": 437}, {"index": 110, "token": "perfection", "end": 582, "start": 572}, {"index": 123, "token": "ambition", "end": 658, "start": 650}, {"index": 131, "token": "rejection", "end": 699, "start": 690}]}

        // array to hold selections on the text based on the tokens recieved from server
        var selectionStates = []
        var count = 0;
        Object.keys(server).forEach((key) => {
            var tokens = server[key];
            tokens.map((token) => {
                var blocks = this.getBlockKeys(token.start,token.end);
                blocks.map((block) => {
                        console.log(token.token,block.key,token.start - block.startOffset - count,token.end - block.startOffset);
                        var selectionState = SelectionState.createEmpty(block.key);
                        //TODO: Fix a bug with expanding selections
                        selectionStates.push(selectionState.merge({
                            anchorOffset:token.start - block.startOffset - count,
                            focusOffset:token.end - block.startOffset
                        }));
                        count++;
                });
            });
        });
        var editorState = this.state.editorState;
        var content = this.state.editorState.getCurrentContent();
        //TODO: Implement as entity to give a popup
        selectionStates.map((updatedState)=>{
                content = Modifier.applyInlineStyle(
                            content,
                            updatedState,
                            'modal'
                );
        });
        
        this.setState({
                editorState: EditorState.createWithContent(content)
        });

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
                            customStyleMap={styleMap}
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