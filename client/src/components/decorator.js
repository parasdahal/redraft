import React from 'react'
import { Entity, CompositeDecorator } from 'draft-js'

const styles = {
    'modal':{
        backgroundColor:'#E3EBF4'
    },
    'adverbs':{
        backgroundColor:'#F7EFC0'
    },
    'weakverbs':{
        backgroundColor:'#F8E0D8'
    },
    'nomilization':{
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

const ModalSpan = (props) => {
    return (
        <span style={styles.modal} data-tooltip="Modal">
        {props.children}
        </span>
    );
};
const AdverbsSpan = (props) => {
    return (
        <span style={styles.adverbs} data-tooltip="Adverb">
        {props.children}
        </span>
    );
};
const WeakverbSpan = (props) => {
    return (
        <span style={styles.weakverbs} data-tooltip="Weak verb">
        {props.children}
        </span>
    );
};
const NomilizationSpan = (props) => {
    return (
        <span style={styles.nomilization} data-tooltip="Nomilization">
        {props.children}
        </span>
    );
};

const decorator = new CompositeDecorator([
    {
        strategy: getEntityStrategy('modal'),
        component: ModalSpan,
    },
    {
        strategy: getEntityStrategy('adverbs'),
        component: AdverbsSpan,
    },
    {
        strategy: getEntityStrategy('weakverbs'),
        component: WeakverbSpan,
    },
    {
        strategy: getEntityStrategy('nomilization'),
        component: NomilizationSpan,
    }
]);

export default decorator