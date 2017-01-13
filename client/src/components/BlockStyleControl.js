import React from 'react';
import {Editor,EditorState,RichUtils} from 'draft-js';
import ReactDOM from 'react-dom';
import StyleButton from './styleButton';

const BLOCK_TYPES = [

    {label:'H1',style:'header-one'},
    {label:'H2',style:'header-two'},
    {label:'H3',style:'header-three'},
    {label:'H4',style:'header-four'},
    {label:'H5',style:'header-five'},
    {label:'H6',style:'header-six'},
    {label:'BlockQuote',style:'blockquote'},
    {label: 'UL', style: 'unordered-list-item'},
    {label: 'OL', style: 'ordered-list-item'}
]

export default class BlockStyleControl extends React.Component{
    
    constructor(props)
    {
        super(props);
        
    }
    render()
    {
        const editorState= props;
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
    }
};