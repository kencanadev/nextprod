import React from 'react'

const data = () => {
  return (
    <div>data</div>
  )
}

export default data

export const nodes = [
    {
        id: 1,
        name: 'Task List-1',
        deadline: new Date('2023-12-31'),
        type: 'SETUP',
        isComplete: false,
        titleA: 'Lorem Ipsum ver 1',
        titleB: 'dolor sit amet ver 1',
        task: 3,
    },
    {
        id: 2,
        name: 'Task List-2',
        deadline: new Date('2023-12-30'),
        type: 'LEARN',
        isComplete: true,
        titleA: 'Lorem Ipsum ver 2',
        titleB: 'dolor sit amet ver 2',
        task: 5,
    },
    {
        id: 3,
        name: 'Task List-3',
        deadline: new Date('2023-12-31'),
        type: 'SETUP',
        isComplete: false,
        titleA: 'Lorem Ipsum ver 3',
        titleB: 'dolor sit amet ver 3',
        task: 3,
    },
    {
        id: 4,
        name: 'Task List-4',
        deadline: new Date('2023-12-30'),
        type: 'LEARN',
        isComplete: true,
        titleA: 'Lorem Ipsum ver 4',
        titleB: 'dolor sit amet ver 4',
        task: 5,
    },
    {
        id: 5,
        name: 'Task List-5',
        deadline: new Date('2023-12-31'),
        type: 'SETUP',
        isComplete: false,
        titleA: 'Lorem Ipsum ver 5',
        titleB: 'dolor sit amet ver 5',
        task: 3,
    },
    {
        id: 6,
        name: 'Task List-6',
        deadline: new Date('2023-12-30'),
        type: 'LEARN',
        isComplete: true,
        titleA: 'Lorem Ipsum ver 6',
        titleB: 'dolor sit amet ver 6',
        task: 5,
    },
];
