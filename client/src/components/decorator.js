import React from 'react'
import { Entity, CompositeDecorator } from 'draft-js'

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
    'nominailization':{
        backgroundColor:'#EEE5EB'
    }
};

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
    const data = entity.getData()
    return (
        <span style={styles[entity.getType()]} data-tooltip={entity.getType()}>
        {props.children}
        </span>
    );
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
    }
]);

export default decorator