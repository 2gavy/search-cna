import React, { useState } from 'react'

import {
  actions,
  AppStatus,
  thunkActions,
  useAppDispatch,
  useAppSelector,
} from 'store/provider'
import { Header } from 'components/header'
import { Chat } from 'components/chat/chat'
import SearchInput from 'components/search_input'
import { ReactComponent as ChatIcon } from 'images/chat_icon.svg'
import { ReactComponent as ElasticLogo } from 'images/elastic_logo.svg'
import { SearchResults } from './components/search_results'
import DossierBox from './components/dossierbox';
import './components/Grid.css'; // Import the grid CSS
import './images/keith.jpg'
const App = () => {
  const dispatch = useAppDispatch()
  const status = useAppSelector((state) => state.status)
  const sources = useAppSelector((state) => state.sources)
  const [summary, ...messages] = useAppSelector((state) => state.conversation)
  const hasSummary = useAppSelector(
    (state) => !!state.conversation?.[0]?.content
  )
  const [searchQuery, setSearchQuery] = useState<string>('')

  const handleSearch = (query: string) => {
    dispatch(thunkActions.search(query))
  }
  const handleSendChatMessage = (query: string) => {
    dispatch(thunkActions.askQuestion(query))
  }
  const handleAbortRequest = () => {
    dispatch(thunkActions.abortRequest())
  }
  const handleToggleSource = (name) => {
    dispatch(actions.sourceToggle({ name }))
  }
  const handleSourceClick = (name) => {
    dispatch(actions.sourceToggle({ name, expanded: true }))

    setTimeout(() => {
      document
        .querySelector(`[data-source="${name}"]`)
        ?.scrollIntoView({ behavior: 'smooth' })
    }, 300)
  }

  // const suggestedQueries = [
  //   'Give me a sample test script for ',
  //   "Give me a user story for ",
  //   "Give me a technical documentation for "
  // ]

  const dossierData = {
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4AWfTvDUlSeEvNDCxQhEoee7SiGtv1vwaK06M9cV3RMIdhbwR1VJcCPcLERmweTBlnwU&usqp=CAU',
    name: 'Keith Tan',
    age: 50,
    nationality: 'Singaporean',
    moreInfo: 'Keith Tan assumed the appointment of Chief Executive of the Singapore Tourism Board on 29 October 2018.    '
  };

  const suggestedQueries = [
    'What are the latest trends in Singapore?',
    'What are the latest trends in technology?',
    "What's the latest bank incidents?",
  ]

  return (
    <>
      <Header />
      <div className="row">
        <div className="col-lg-3 col-md-4 col-sm-2">
        </div>
        <div className="col-lg-6 col-md-4 col-sm-8 middle-element p-4 max-w-2xl mx-auto">
          <SearchInput
            onSearch={handleSearch}
            value={searchQuery}
            appStatus={status}
          />

          {status === 'idle' ? (
            <div className="mx-auto my-6">
              <h2 className="text-zinc-400 text-sm font-medium mb-3 inline-flex items-center gap-2">
                <ChatIcon /> Common questions
              </h2>
              <div className="flex flex-col space-y-4">
                {suggestedQueries.map((query) => (
                  <button
                    key={query}
                    className="hover:-translate-y-1 hover:shadow-lg hover:bg-zinc-300 transition-transform h-12 px-4 py-2 bg-zinc-200 rounded-md shadow flex items-center text-zinc-700"
                    onClick={(e) => {
                      e.preventDefault()
                      setSearchQuery(query)
                      handleSearch(query)
                    }}
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {hasSummary ? (
                <div className="max-w-2xl mx-auto relative">
                  <Chat
                    status={status}
                    messages={messages}
                    summary={summary}
                    onSend={handleSendChatMessage}
                    onAbortRequest={handleAbortRequest}
                    onSourceClick={handleSourceClick}
                  />

                  <SearchResults
                    results={sources}
                    toggleSource={handleToggleSource}
                  />
                </div>
              ) : (
                <div className="h-36 p-6 bg-white rounded-md shadow flex flex-col justify-start items-center gap-4 mt-6">
                  <ElasticLogo className="w-16 h-16" />
                  <p className="text-center text-zinc-400 text-sm ">
                    Looking that up for you...
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        <div className="col-lg-3 col-md-2 col-sm-1 p-4 p-10 ">
          <DossierBox
            image={dossierData.image}
            name={dossierData.name}
            age={dossierData.age}
            nationality={dossierData.nationality}
            moreInfo={dossierData.moreInfo}
          />
        </div>
      </div>
    </>
  )
}

export default App
