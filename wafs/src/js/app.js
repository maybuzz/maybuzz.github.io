(() => {

  const app = {
    init: () => {
      console.log("app: init")
      router.handle()
      router.hash()
    },
    config: {
      url: `https://ghibliapi.herokuapp.com/films/`
    }
  }

  const router = {
    handle: () => {
      let hash = window.location.hash.split("#")[1]
      if (window.localStorage.getItem("movie-"+hash)) {
        console.log("router: handle for "+hash)
        routes.detail(hash)
      } else {
        console.log("router: handle for overview" );
        window.location.hash = ""
        routes.overview()
      }
    },
    hash: () => {
      window.addEventListener("hashchange", () => {
        let movieID = window.location.hash.substr(1)
        const clearAll = clear.clearView()
        const renderDetail = router.handle(movieID)
      })
    }
  }

  const routes = {
    overview: async () => {

      console.log("routes: overview")

      render.onload()

      api.getData()
        .then((allData) => {
          const cleanData = api.formatData(allData)
          const renderOverview = render.overview(cleanData)
        })
        .catch((err) => { console.warn(err); render.error("data error") })
    },
    detail: (id) => {

      console.log("routes: detail")

      render.onload()

      const renderDetail = render.detail(id)

    }
  }

  const api = {
    getData: () => {
      console.log("api: getData")

      return fetch(app.config.url)
      .then((response) => { return response.json() })
      .catch((err) => { console.warn(err); render.error("api error") })
    },
    formatData: (data) => {
      console.log("api: formatData")
      const itemList = data.map((item) => {

        const format = {
          id: item.id,
          title: item.title,
          description: item.description,
          date: item.release_date,
          rtScore: item.rt_score,
          director: item.director,
          producer: item.producer,
          url: item.url
        }

        return format

        window.localStorage.setItem('movie-'+item.id,JSON.stringify(format))
      })
    }
  }

  const clear = {
    clearView: () => {
      console.log("clear: getData")
      const app = document.getElementById('main')

      while (app.firstChild) {
          app.removeChild(app.firstChild)
      }
    }
  }

  const render = {
    overview: (movies) => {
      document.getElementById('spinner').remove()

      console.log("render: overview")

      movies = Object.keys(window.localStorage).filter((v) => v.startsWith('movie-'))

      return movies.forEach((movie) => {

        var data = JSON.parse(window.localStorage.getItem(movie))

        const app = document.getElementById('main')

        const card = document.createElement('article')

        const title = document.createElement('h1')
              title.textContent = data.title

        const link = document.createElement('a')
              link.setAttribute('href', '#' + data.id)

        const text = document.createElement('p')
              text.setAttribute('class', 'text')
              data.description = data.description
              data.description = data.description.substring(0, 200)
              text.textContent = `${data.description}...`

              app.appendChild(link)
              link.appendChild(card)

              card.appendChild(title)
              card.appendChild(text)
      })
    },
    detail: (movieID) => {

      document.getElementById('spinner').remove()

      console.log("render: detail")

      const movieData = JSON.parse(localStorage.getItem("movie-"+movieID))

      if (movieData === null) {
        render.error("id undefined")
        return
      }

      const app = document.getElementById('main')

      const section = document.createElement('section')

      const link = document.createElement('a')
            link.setAttribute('href', '/src')
            link.textContent = "terug naar overzicht"

      const title = document.createElement('h1')
            title.setAttribute('class', 'title')
            title.textContent = movieData.title

      const heading1 = document.createElement('h3')
            heading1.textContent = "director"

      const heading2 = document.createElement('h3')
            heading2.textContent = "producer"

      const heading3 = document.createElement('h3')
            heading3.textContent = "rotten tomatoes"

      const text = document.createElement('p')
            text.setAttribute('class', 'text')
            text.textContent = movieData.description

      const director = document.createElement('p')
            director.setAttribute('class', 'director')
            director.textContent = movieData.director

      const producer = document.createElement('p')
            producer.setAttribute('class', 'producer')
            producer.textContent = movieData.producer

      const year = document.createElement('p')
            year.setAttribute('class', 'year')
            year.textContent = movieData.date

      const score = document.createElement('p')
            score.setAttribute('class', 'score')
            score.textContent = movieData.rtScore


            app.appendChild(section)

            section.appendChild(link)
            section.appendChild(title)
            section.appendChild(text)
            section.appendChild(year)
            section.appendChild(heading3)
            section.appendChild(score)
            section.appendChild(heading1)
            section.appendChild(director)
            section.appendChild(heading2)
            section.appendChild(producer)

    },
    onload: () => {

      const app = document.getElementById('main')

      const spinner = document.createElement('div')
            spinner.setAttribute('id', 'spinner')

      const bounce1 = document.createElement('div')
            bounce1.setAttribute('class', 'double-bounce1')

      const bounce2 = document.createElement('div')
            bounce2.setAttribute('class', 'double-bounce2')

            app.appendChild(spinner)

            spinner.appendChild(bounce1)
            spinner.appendChild(bounce2)

    },
    error: (err) => {
      document.getElementById('spinner').remove()

      console.warn("application err: ", err)

      const app = document.getElementById('main')

      const section = document.createElement('section')

      const link = document.createElement('a')
            link.setAttribute('href', '/src')
            link.textContent = "terug naar overzicht"

      const title = document.createElement('h1')
            title.setAttribute('class', 'error')
            title.textContent = "error"

      const text = document.createElement('p')
            text.setAttribute('class', 'text')
            text.textContent = "Oops... something went wrong"


            app.appendChild(section)

            section.appendChild(title)
            section.appendChild(text)
            section.appendChild(link)
    }
  }

  app.init()

})()
