import { useState } from 'react';

const Coba: React.FC = () => {
    const [activeTab, setActiveTab] = useState('active');

    const tabs = [
        { id: 'active', label: 'Active' },
        { id: 'menu1', label: 'menu 1' },
        { id: 'menu2', label: '' }, // Tab kosong sesuai gambar
    ];

    return (
        <div className="w-[500px] border border-black">
            {/* Tab Buttons */}
            <div className="flex border-b border-black">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`rounded-t-lg border border-black px-3 py-1 text-sm ${activeTab === tab.id ? 'bg-white font-bold' : 'bg-gray-200'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-4">
                {activeTab === 'active' && <p>Content for Active tab</p>}
                {activeTab === 'menu1' && <p>Content for Menu 1</p>}
                {activeTab === 'menu2' && <p>Content for Empty Tab</p>}
            </div>
        </div>
    );
};

export default Coba;
