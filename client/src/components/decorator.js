import React from 'react'
import { Entity, CompositeDecorator } from 'draft-js'

function getEntityStrategy(entityType) {
    return function(contentBlock, callback, contentState) {
        contentBlock.findEntityRanges(
        (character) => {
            const entityKey = character.getEntity();
            if (entityKey === null) {
            return false;
            }
            return Entity.get(entityKey).getType() === entityType;
        },
        callback
        );
    };
}

const TokenSpan = (props) => {
    const entity = Entity.get(props.entityKey)
    const data = entity.getData();
    var replace = '';
    if(data.replace)replace = data.replace;
    return (
                <span style={styles[entity.getType()]} className="tooltip">
                {props.children}
                    <span className="tooltip-data" style={styles[entity.getType()]}>
                        <strong>{data.title}</strong><br/>
                        {data.suggestion}<br/>
                        <em>{replace}</em>
                    </span>
                </span>
            
    );
};

const styles = {
    'modal':{
        backgroundColor:'#E3EBF4'
    },
    'adverb':{
        backgroundColor:'#F7EFC0'
    },
    'weakverb':{
        backgroundColor:'#F8E0D8'
    },
    'nominalization':{
        backgroundColor:'#EEE5EB'
    },
    'tasteandsmell':{
        backgroundColor:'rgb(219,239,182)'
    },
    'suggestions':{
        backgroundColor:'#EFF2F5'
    }
};

const decorator = new CompositeDecorator([
    {
        strategy: getEntityStrategy('modal'),
        component: TokenSpan,
    },
    {
        strategy: getEntityStrategy('adverb'),
        component: TokenSpan,
    },
    {
        strategy: getEntityStrategy('weakverb'),
        component: TokenSpan,
    },
    {
        strategy: getEntityStrategy('nominalization'),
        component: TokenSpan,
    },
    {
        strategy: getEntityStrategy('tasteandsmell'),
        component: TokenSpan,
    },
    {
        strategy: getEntityStrategy('suggestions'),
        component: TokenSpan,
    },
]);

export default decorator