import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Editor from 'draft-js-plugins-editor';
import createLinkifyPlugin from 'draft-js-linkify-plugin';
import createMarkdownShortcutsPlugin from 'draft-js-markdown-shortcuts-plugin';
import {EditorState,ContentState,RichUtils,convertToRaw,convertFromRaw,SelectionState,Modifier,Entity} from 'draft-js';
import decorator from './decorator.js'
import content from '../utils/content';
import response from '../utils/response';
import BlockStyleControls from './blockStyleControls';

/**
 * URL for analysis API
 */
const API_URL = "http://localhost:8888/analyze";

/**
 * Drfat-js plugins
 */
const plugins = [
  createMarkdownShortcutsPlugin(),
  createLinkifyPlugin()
];


export default class RedraftEditor extends React.Component{

    constructor(props)
    {
        super(props);

        this.state ={editorState: EditorState.createWithContent(convertFromRaw(content),decorator)};
        
        /**
         * Binding method contexts to the class
         */
        this.onChange = (editorState) => this.setState({editorState});
        this.handleKeyCommand = (command) => this._handleKeyCommand(command);
        this.toggleBlockType = (type) => this._toggleBlockType(type);
        this.getSuggestion = () => this._getSuggestion();
        this.getBlockKeys = this.getBlockKeys.bind(this);
        this.logState = () => {console.log(convertToRaw(this.state.editorState.getCurrentContent()));};
    }

    /**
     * Handles keyboard shortcuts for bold, italics, underline, undo etc.
     */
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
    /**
     * Toggles Block type
     */
    _toggleBlockType(blockType)
    {
        this.onChange(
            RichUtils.toggleBlockType(
                this.state.editorState,
                blockType
            )
        );
    }

    /**
     * Given document level start and end offset of a token (from API), returns the array of blocks in which the token exists
     */
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
    /**
     * Creates entities for tokens returned by the API which is then handled by decorator.js
     */
    _getSuggestion()
    {
        var server = response;
        
        var selectionStates = []
        Object.keys(server).forEach((key) => {
            var tokens = server[key];
            tokens.instances.map((token) => {
                var blocks = this.getBlockKeys(token.start,token.end);
                blocks.map((block) => {
                        //TODO:Doesnt work properly for long sentences (maybe entity are clashing?)
                        var selectionState = SelectionState.createEmpty(block.key);
                        var start = token.start - block.startOffset - block.index;
                        var end = start + (token.end - token.start);
                        var updatedSelection = selectionState.merge({
                            anchorOffset:start,
                            focusOffset:end,
                        });
                        selectionStates.push({
                            entity:key,
                            data:token.data,
                            selection:updatedSelection
                        });
                        
                });
            });
        });
        var editorState = this.state.editorState;
        var content = this.state.editorState.getCurrentContent();
        selectionStates.map((item)=>{
                const data = item.data;
                const entityKey = Entity.create(item.entity,'MUTABLE', data);
                content = Modifier.applyEntity(
                            content,
                            item.selection,
                            entityKey
                );
        })  
        this.setState({editorState: EditorState.createWithContent(content,decorator)});

    }
    
    /**
     * React component render 
     */
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
                            plugins = {plugins}
                        />
                </div>
        );
    }

}